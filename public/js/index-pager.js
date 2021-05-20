/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.
var db = firebase.database(); //firebase의 database모듈을 불러온다.
var ref = db.ref('root/board');
var user = null;

// Pagination
var page = 1;
var pagerCnt = 3;
var listCnt = 5;
var totalRecord = 0;

var $tbody = $('.list-wrapper tbody');
var $form = $('.create-form');
var $pager = $('.pager-wrapper').find('.pagination');


/*************** 사용자 함수 *****************/
function genLists() {
	ref.get().then(onGetData);
	function onGetData(r) {
		$tbody.empty();
		totalRecord = r.numChildren();
		var startIdx = (page - 1) * listCnt;
		var endIdx = startIdx + listCnt > totalRecord ? totalRecord : startIdx + listCnt;
		var temp = [];
		r.forEach(function(v) { temp.unshift(v) });	// 순서 뒤바꿈
		console.log(temp);
		for(var i=startIdx; i<endIdx; i++) {
			genHTML(temp[i].key, temp[i].val(), 'append');
		}
		var totalPage = Math.ceil(totalRecord / listCnt);
		var startIdx = (page - 1) * listCnt;
		var startPage = Math.floor((page - 1) / pagerCnt) * pagerCnt + 1;
		var endPage = (startPage + pagerCnt - 1 > totalPage) ? totalPage : startPage + pagerCnt - 1;
		var nextPage = (page + 1 > totalPage) ? totalPage : page + 1;
		var prevPage = (page - 1 < 1) ? 1 : page - 1;
		var nextPager = (endPage + 1 > totalPage) ? totalPage : endPage + 1;
		var prevPager = (startPage - 1 < 1) ? 1 : startPage - 1;
		console.log('page => ', page);
		console.log('totalRecord => ', totalRecord);
		console.log('startIdx => ', startIdx);
		console.log('startPage => ', startPage);
		console.log('endPage => ', endPage);
		console.log('nextPage => ', nextPage);
		console.log('prevPage => ', prevPage);
		console.log('nextPager => ', nextPager);
		console.log('prevPager => ', prevPager);

		var html = '';
		html += '<li class="page-item" data-page="1">';
		html += '<span class="page-link bi-chevron-bar-left"></span>';
		html += '</li>';
		html += '<li class="page-item" data-page="'+prevPager+'">';
		html += '<span class="page-link bi-chevron-double-left"></span>';
		html += '</li>';
		html += '<li class="page-item" data-page="'+prevPage+'">';
		html += '<span class="page-link bi-chevron-left"></span>';
		html += '</li>';
		for(var i=startPage; i<=endPage; i++) {
			html += '<li class="page-item '+(i == page ? 'active' : '')+'" data-page="'+i+'">';
			html += '<span class="page-link">'+i+'</span>';
			html += '</li>';
		}
		html += '<li class="page-item" data-page="'+nextPage+'">';
		html += '<span class="page-link bi-chevron-right"></span>';
		html += '</li>';
		html += '<li class="page-item" data-page="'+nextPager+'">';
		html += '<span class="page-link bi-chevron-double-right"></span>';
		html += '</li>';
		html += '<li class="page-item" data-page="'+totalPage+'">';
		html += '<span class="page-link bi-chevron-bar-right"></span>';
		html += '</li>';
		$pager.html(html);
		$pager.find('.page-item').click(onPagerClick);
	}
}

function onPagerClick() {
	page = $(this).data('page');
	genLists();
}

function genHTML(k, v, method) {
	var html = '';
	html += '<tr class="id" id="'+k+'" data-uid="'+v.uid+'" data-sort="'+v.sort+'">';
	html += '<td>&nbsp;';
	html += '</td>';
	html += '<td class="content text-left"><span>'+v.content+'</span>';
	html += '<div class="btn-group mask">';
	html += '<button class="bt-chg btn btn-sm btn-info"><i class="fa fa-edit"></i></button>';
	html += '<button class="bt-rev btn btn-sm btn-info"><i class="fa fa-trash-alt"></i></button>';
	html += '</div>';
	html += '</td>';
	html += '<td class="writer">'+v.writer+'</td>';
	html += '<td class="date">'+moment(v.createdAt).format('YYYY-MM-DD')+'</td>';
	html += '<td class="readnum">'+v.readnum+'</td>';
	html += '</tr>';
	var $tr = (method && method == 'append') ? $(html).appendTo($tbody) : $(html).prependTo($tbody);

	var num = totalRecord - (page-1) * listCnt;
	$tbody.find('tr').each(function(i) {
		$(this).find('td:first-child').text(num--);
	});

	setTimeout(function(){ $tr.addClass('active'); }, 100);
	$tr.mouseenter(onTrEnter);
	$tr.mouseleave(onTrLeave);
	$tr.find('.bt-chg').click(onChgClick);
	$tr.find('.bt-rev').click(onRevClick);
	return $tr;
}

$tbody.empty();


/*************** 이벤트 등록 *****************/
auth.onAuthStateChanged(onChangeAuth);
// ref.limitToLast(listCnt).on('child_added', onAdded);
ref.on('child_removed', onRemoved);
ref.on('child_changed', onChanged);

$('.bt-login').click(onLoginGoogle);
$('.bt-logout').click(onLogOut);
$form.find('.bt-cancel').click(onReset);
// $(window).resize(onResize);

genLists();


/*************** 이벤트 콜백 *****************/
function onRemoved(r) {
	$('#'+r.key).remove();
	genLists();
}

function onChanged(r) {
	$('#'+r.key).find('.writer').text(r.val().writer);
	$('#'+r.key).find('.content > span').text(r.val().content);
	$('#'+r.key).find('.readnum').text(r.val().readnum);
	$('#'+r.key).find('.date').text(moment(r.val().updatedAt).format('YYYY-MM-DD'));
}

function onChgClick() {
	var key = $(this).parents('tr').attr('id');
	ref.child(key).get().then(function(r) {
		$form.find('[name="key"]').val(r.key);
		$form.find('[name="writer"]').val(r.val().writer);
		$form.find('[name="content"]').val(r.val().content);
		$form.find('.bt-create').hide();
		$form.find('.btn-group').show();
		$form.addClass('active');
	}).catch(function(err) {
		console.log(err);
	});
}

function onRevClick() {
	if(confirm('정말로 삭제하시겠습니까?')) {
		var key = $(this).parents('tr').attr('id');
		ref.child(key).remove();	// 실제 firebase의 데이터 삭제
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

function onReset() {
	$form.find('[name="writer"]').val(user.displayName);
	$form.find('[name="content"]').val('');
	$form.find('[name="key"]').val('');
	$form.find('.btn-group').hide();
	$form.find('.bt-create').show();
	$form.removeClass('active');
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


	var data = { writer: f.writer.value, content: f.content.value }
	if(user && user.uid) {
		if(f.key.value === '') {
			data.createdAt = new Date().getTime();
			data.readnum = 0;
			data.uid = user.uid;
			data.sort = -data.createdAt;
			ref.push(data);
			page = 1;
			genLists();
		}
		else {
			data.updatedAt = new Date().getTime();
			ref.child(f.key.value).update(data);
		}
	}
	else alert('정상적인 접근이 아닙니다.');

	$(f).removeClass('active');
	f.key.value = '';
	f.writer.value = user.displayName;
	f.content.value = '';
	f.content.focus();
	$form.find('.btn-group').hide();
	$form.find('.bt-create').show();

	return false;
}

function onChangeAuth(r) {
	user = r;
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


