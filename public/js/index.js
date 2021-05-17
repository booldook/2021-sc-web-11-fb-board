/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.
var db = firebase.database(); //firebase의 database모듈을 불러온다.
var user = null;


var $tbody = $('.list-wrapper tbody');


/*************** 사용자 함수 *****************/
$tbody.empty();


/*************** 이벤트 등록 *****************/
auth.onAuthStateChanged(onChangeAuth);
db.ref('root/board').on('child_added', onAdded);
db.ref('root/board').on('child_removed', onRemoved);
db.ref('root/board').on('child_changed', onChanged);

$('.bt-login').click(onLoginGoogle);
$('.bt-logout').click(onLogOut);
// $(window).resize(onResize);


/*************** 이벤트 콜백 *****************/
function onRemoved(r) {
	$('#'+r.key).remove();
}

function onChanged(r) {
	console.log(r);
}

function onAdded(r) {
	var k = r.key;
	var v = r.val();
	var i = $tbody.find('tr').length + 1;
	var html = '';
	html += '<tr id="'+k+'" data-uid="'+v.uid+'">';
	html += '<td>'+i;
	html += '</td>';
	html += '<td class="text-left">'+v.content;
	html += '<div class="btn-group mask">';
	html += '<button class="bt-chg btn btn-sm btn-info"><i class="fa fa-edit"></i></button>';
	html += '<button class="bt-rev btn btn-sm btn-info"><i class="fa fa-trash-alt"></i></button>';
	html += '</div>';
	html += '</td>';
	html += '<td>'+v.writer+'</td>';
	html += '<td>'+moment(v.createdAt).format('YYYY-MM-DD')+'</td>';
	html += '<td>'+v.readnum+'</td>';
	html += '</tr>';
	var $tr = $(html).prependTo($tbody);
	$tr.mouseenter(onTrEnter)
	$tr.mouseleave(onTrLeave);
	$tr.find('.bt-chg').click(onChgClick);
	$tr.find('.bt-rev').click(onRevClick);
}

function onChgClick() {
	console.log( $(this).parents('tr').attr('id') );
}

function onRevClick() {
	if(confirm('정말로 삭제하시겠습니까?')) {
		var key = $(this).parents('tr').attr('id');
		db.ref('root/board/' + key).remove();	// 실제 firebase의 데이터 삭제
		/*
			삭제로직
			1. db.ref('root/board/' + key).remove();	// firebase remove()
			2. db.ref('root/board/').on('child_removed', onRemoved); 실제 데이터가 삭제되면 이벤트 실행
			3. function onRemoved(r) { r: 삭제된 데이터
				$('#'+r.key).remove();	// jQuery remove()
			}
		*/
	}
}

function onTrEnter() {
	var uid = $(this).data('uid');
	if(user && uid === user.uid) {
		$(this).find('.mask').css('display', 'inline-block');
	}
}

function onTrLeave() {
	$(this).find('.mask').css('display', 'none');
}

function onResize() {
	var wid = $('.list-tb').innerWidth();
	$('.list-tb .mask').innerWidth(wid);
}

function onSubmit(f) {
	if(f.writer.value.trim() === '') {
		alert('작성자는 필수사항 입니다.');
		f.writer.focus();
		return false;
	}
	
	if(f.content.value.trim() === '') {
		alert('한 줄 내용은 필수사항 입니다.');
		f.content.focus();
		return false;
	}

	var data = {
		writer: f.writer.value,
		content: f.content.value,
		createdAt: new Date().getTime(),
		uid: user.uid,
		readnum: 0
	}
	if(user && user.uid) db.ref('root/board/').push(data);
	else alert('정상적인 접근이 아닙니다.');
	
	f.content.value = '';
	f.content.focus();

	return false;
}

function onChangeAuth(r) {
	user = r;
	console.log(user);
	if(user) {
		$('.header-wrapper .email').text(user.email);
		$('.header-wrapper .photo img').attr('src', user.photoURL);
		$('.header-wrapper .info-wrap').css('display', 'flex');
		$('.create-wrapper').show();
		$('.create-wrapper input[name="writer"]').val(user.displayName);
		$('.bt-login').hide();
		$('.bt-logout').show();
	}
	else {
		$('.header-wrapper .email').text('');
		$('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333');
		$('.header-wrapper .info-wrap').css('display', 'none');
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


