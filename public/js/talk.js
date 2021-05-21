/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.
var db = firebase.database();
var talkRef = db.ref('root/talk');
var roomRef = db.ref('root/room');

var $listWrapper = $('.list-wrapper');

var yoil = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
var prevDate = '';

/*************** Auth *****************/
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
		$('.room-wrapper').find('input[name="writer"]').val(user.displayName);
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
		$('.room-wrapper').find('input[name="writer"]').val('');
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



/*************** firebase event *****************/
talkRef.on('child_added', onTalkAdded);
roomRef.on('child_added', onRoomAdded);
roomRef.on('child_changed', onRoomChanged);
roomRef.on('child_removed', onRoomRemoved);



/*************** talk *****************/
function onTalkAdded(r) {
	genTalk(r.key, r.val());
}

function genTalk(k, v) {
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

/******************** room ***********************/
function onRoomSubmit(f) {
	if(f.name.value.trim() === '') {
		alert('방제목을 입력하셔야 합니다.');
		f.name.focus();
		return false;
	}
	if(f.writer.value.trim() === '') {
		alert('방장을 입력하셔야 합니다.');
		f.writer.focus();
		return false;
	}
	var data = { name: f.name.value, writer: f.writer.value, roompw: f.roompw.value }
	if(f.key && f.key.value) { // 수정
		data.updatedAt = new Date().getTime();
		if(f.roompw.value.trim() !== '') data.roompw.value = f.roompw.value;
		roomRef.child(f.key.value).update(data);
		alert('방 정보가 변경되었습니다.');
	}
	else { // 신규등록
		data.rid = uuidv4();
		data.uid = user.uid;
		data.createdAt = new Date().getTime();
		roomRef.push(data);
		f.name.value = '';
		f.roompw.value = '';
	}
	return false;
}

function onRoomDelete(el) {
	if(confirm('정말로 삭제하시겠습니까? 삭제하시면 채팅내용도 삭제됩니다.')) {
		var key = el.form.key.value;
		roomRef.child(key).remove(); // farebase에서 삭제
	}
}

function onRoomAdded(v) {
	genRoom(v.key, v.val());
}

function onRoomChanged(v) {
	var html = $(genRoom(v.key, v.val(), true)).html();
	$('#'+v.key).html(html);
}

function onRoomRemoved(v) {
	$('#'+v.key).remove(); // jQuery remove()
}

function genRoom(k, v, isChange) {
	var html = '';
	html += '<div class="room-wrap '+(v.roompw !== '' ? 'secure' : '')+'" id="'+k+'">';
	if(user.uid === v.uid) {
			html += '<form class="create" onsubmit="return onRoomSubmit(this);">';
			html += '<input type="hidden" name="key" value="'+k+'">';
			html += '<div class="name">';
			html += '<input type="text" class="form-control" name="name" placeholder="방제목" value="'+v.name+'">';
			html += '</div>';
			html += '<div class="writer form-inline">';
			html += '<input type="text" class="form-control" name="writer" placeholder="방장이름" value="'+v.writer+'">';
			html += '<input type="password" class="form-control" name="roompw" placeholder="비밀번호">';
			html += '<div class="text-danger">';
			html += '* 비밀번호 입력시 비밀번호가 수정됩니다.<br>';
			html += '* 미 입력시 오픈채팅으로 변경됩니다.';
			html += '</div>';
			html += '</div>';
			html += '<div class="btn-wrap">';
			html += '<button class="btn btn-sm btn-success">';
			html += '<i class="bt-update fa fa-save"></i> 수정';
			html += '</button> ';
			html += '<button type="button" class="btn btn-sm btn-danger" onclick="onRoomDelete(this);">';
			html += '<i class="bt-update fa fa-times"></i> 삭제';
			html += '</button>';
			html += '</div>';
			html += '</form>';
	}
	else {
		html += '<h3 class="name">'+v.name+'</h3>';
		html += '<h4 class="writer">'+v.writer+'</h4>';
		html += '<div class="date mb-4">개설: '+moment(v.createdAt).format('YYYY-MM-DD')+'</div>';
	}
	html += '<form class="enter-wrap form-inline">';
	if(v.roompw) 
		html += '<input type="password" name="roompw" class="form-control" placeholder="비밀번호">&nbsp;';
	html += '<input type="hidden" name="rid" value="'+v.rid+'" onsubmit="return onRoomEnter(this);">';
	html += '<button class="btn btn-primary">방 입장</button>';
	html += '</form>';
	html += '</div>';
	if(isChange) return html;
	else $('.room-wrap.create').after(html);
}
