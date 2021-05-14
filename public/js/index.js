/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider();	// 구글로그인 모듈을 불러온다.


/*************** 사용자 함수 *****************/



/*************** 이벤트 등록 *****************/
$('.bt-login').click(onLogin);


/*************** 이벤트 콜백 *****************/
function onLogin() {
	auth.signInWithPopup(googleAuth);
}

