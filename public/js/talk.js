/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.
var db = firebase.database();
var ref = db.ref('root/talk');

var $listWrapper = $('.list-wrapper');

/*************** 인증 *****************/
auth.onAuthStateChanged(onChangeAuth);
$('.bt-login').click(onLoginGoogle);
$('.bt-logout').click(onLogOut);

function onChangeAuth(r) {
	user = r;
	if(user) {
		$('.header-wrapper .photo img').attr('src', user.photoURL);
		$('.create-wrapper img').attr('src', user.photoURL);
		$('.header-wrapper .info-wrap').css('display', 'flex');
		$('.header-wrapper .logo i').css('display', 'none');
		$('.create-wrapper').show();
		$('.list-wrapper').show();
		$('.gap-wrapper').css('flex-grow', 0);
		$('.gap-wrapper .gap-wrap').css('display', 'none');
		$('.create-wrapper input[name="writer"]').val(user.displayName);
		$('.bt-login').css('display', 'none');
		$('.bt-logout').css('display', 'flex');
	}
	else {
		$('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333');
		$('.create-wrapper img').attr('src', '//via.placeholder.com/1x1/fff');
		$('.header-wrapper .info-wrap').css('display', 'none');
		$('.header-wrapper .logo i').css('display', 'inline-block');
		$('.create-wrapper').hide();
		$('.list-wrapper').hide();
		$('.gap-wrapper').css('flex-grow', 1);
		$('.gap-wrapper .gap-wrap').css('display', 'flex');
		$('.create-wrapper input[name="writer"]').val('');
		$('.bt-login').css('display', 'flex');
		$('.bt-logout').css('display', 'none');
	}
}

function onLogOut() {
	auth.signOut();
}

function onLoginGoogle() {
	auth.signInWithPopup(googleAuth);
}

/*************** 데이터  *****************/
ref.on('child_added', onAdded);

function onAdded(r) {
	genHTML(r.key, r.val());
}

function genHTML(k, v) {
	var content = v.content.replace(URLPattern, URLReplace);
	var html = '';
	html += '<div class="line"><span>2021년 5월 20일 목요일<span></div>';
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
