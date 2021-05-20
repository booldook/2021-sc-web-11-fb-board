/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.

/*************** 이벤트 등록 *****************/
auth.onAuthStateChanged(onChangeAuth);
$('.bt-login').click(onLoginGoogle);
$('.bt-logout').click(onLogOut);

/*************** 이벤트 콜백 *****************/
function onChangeAuth(r) {
	user = r;
	if(user) {
		$('.header-wrapper .photo img').attr('src', user.photoURL);
		$('.header-wrapper .info-wrap').css('display', 'flex');
		$('.header-wrapper .logo i').css('display', 'none');
		$('.create-wrapper').show();
		$('.create-wrapper input[name="writer"]').val(user.displayName);
		$('.bt-login').hide();
		$('.bt-logout').show();
	}
	else {
		$('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333');
		$('.header-wrapper .info-wrap').css('display', 'none');
		$('.header-wrapper .logo i').css('display', 'inline-block');
		$('.create-wrapper').hide();
		$('.create-wrapper input[name="writer"]').val('');
		$('.bt-login').show();
		$('.bt-logout').hide();
	}
}

function onLogOut() {
	auth.signOut();
}

function onLoginGoogle() {
	auth.signInWithPopup(googleAuth);
}


