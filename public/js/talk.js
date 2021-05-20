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


