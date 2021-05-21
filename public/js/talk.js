/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.
var db = firebase.database();
var ref = db.ref('root/talk');

var $listWrapper = $('.list-wrapper');

var yoil = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
var prevDate = '';

/*************** 인증 *****************/
auth.onAuthStateChanged(onChangeAuth);
$('.bt-login').click(onLoginGoogle);
$('.bt-logout').click(onLogOut);

function onChangeAuth(r) {
	user = r;
	if(user) {
		$('.header-wrapper .photo img').attr('src', user.photoURL);
		$('.header-wrapper .info-wrap').css('display', 'flex');
		$('.header-wrapper .logo i').css('display', 'none');
		$('.room-wrapper').css('display', 'flex');
		$('.login-wrapper').css('display', 'none');
		$('.bt-login').css('display', 'none');
		$('.bt-logout').css('display', 'flex');
		
		// $('.create-wrapper img').attr('src', user.photoURL);
		// $('.create-wrapper input[name="writer"]').val(user.displayName);
	}
	else {
		$('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333');
		$('.header-wrapper .info-wrap').css('display', 'none');
		$('.header-wrapper .logo i').css('display', 'inline-block');
		$('.room-wrapper').css('display', 'none');
		$('.login-wrapper').css('display', 'flex');
		$('.bt-login').css('display', 'flex');
		$('.bt-logout').css('display', 'none');
		// $('.create-wrapper img').attr('src', '//via.placeholder.com/1x1/fff');
		// $('.create-wrapper input[name="writer"]').val('');
	}
}

function onLogOut() {
	auth.signOut();
}

function onLoginGoogle() {
	auth.signInWithPopup(googleAuth);
}

/*************** 데이터  *****************/
ref.orderByChild('createdAt').on('child_added', onAdded);

function onAdded(r) {
	genHTML(r.key, r.val());
}

function genHTML(k, v) {
	var content = v.content.replace(URLPattern, URLReplace);
	var html = '';
	if(prevDate !== moment(v.createdAt).format('YYYYMMDD')) {
		prevDate = moment(v.createdAt).format('YYYYMMDD'); //20210520
		html += '<div class="line"><span>';
		html += moment(v.createdAt).format('YYYY년 M월 D일 ') + yoil[new Date(v.createdAt).getDay()]
		html += '<span></div>';
	}
	html += '<div class="talk-wrapper '+ (v.uid === user.uid ? 'me' : '')+'" id="'+k+'">';
	if(v.uid !== user.uid) {
		html += '<div class="icon">';
		html += '<img src="'+v.photo+'" alt="icon" class="w-100">';
		html += '</div>';
	}
	html += '<div class="talk-wrap">';
	html += '<div class="writer">'+v.name+'</div>';
	html += '<div class="content-wrap">';
	html += '<i class="fa fa-caret-left left"></i>';
	html += '<i class="fa fa-caret-right right"></i>';
	html += '<div class="content">'+content+'</div>';
	html += '<div class="date">'+moment(v.createdAt).format('a h:m')+'</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	$listWrapper.append(html);
	$listWrapper.scrollTop($listWrapper[0].scrollHeight);
}

function onSubmit(f) {
	if($(f.content).val().trim() !== '') {
		console.log(new Date());
		var data = {
			uid: user.uid,
			photo: user.photoURL,
			name: user.displayName,
			content: $(f.content).val(),
			createdAt: new Date().getTime()
		}
		ref.push(data);
		$(f.content).val('');
	}
	$(f.content).focus();
	return false;
}
