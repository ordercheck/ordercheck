
var layerset = null;

var cntwrap = '#wrap',  // 페이지 컨텐츠 영역
	layer = '.layer-pop', // 레이어 팝업 공통 클래스
	layercnt = '.layer-cnt', // 레이어 팝업 내 컨텐츠 영역 클래스
	closebtn = '.layer-close',
	onClass = 'now-open'; // 레이어 팝업 오픈 시킨 버튼에 지정될 임시 클래스

function popSet(tg, btn, bgSet, middle){
	if(bgSet == null) {
		//tabIndexOff(cntwrap);
	} else {
		layerset = bgSet;
		//indexOffScroll(cntwrap);
	}
	if(middle == true)	popPos(tg);
	else null;
}

function popPos(e){
	var tgCnt = e.querySelector(layercnt);
	var layerH = tgCnt.clientHeight() / 2;
	tgCnt.style.top = '50%'
	tgCnt.style.marginTop = '-'+layerH+'px'
}

// 팝업 오픈 시 페이지내 탭 요소 컨트롤 + 페이지 scroll 제어
function indexOffScroll(cntwrap){
	if(layerset == 'fixed') { document.querySelector(cntwrap).style.position = "fixed"}

    var allCnt = document.querySelectorAll(''+cntwrap+' a, '+cntwrap+' button, '+cntwrap+' input')
    Array.prototype.forEach.call(allCnt, function(cnt, idx){
      cnt.setAttribute('tabindex','-1');
	  });
}
function indexOnScroll(cntwrap){
	if(layerset == 'fixed') {document.querySelector(cntwrap).style.position = "relative"}

	var allCnt = document.querySelectorAll(''+cntwrap+' a, '+cntwrap+' button, '+cntwrap+' input')
    Array.prototype.forEach.call(allCnt, function(cnt, idx){
      cnt.setAttribute('tabindex','-1');
	  });
}

/* 변수 안내
e = 레이어 호출 버튼.
pos = 레이어 위치 관련 변수 - 값이 없을 경우 - 화면 중앙
*/

// 버튼용 함수
function layerOpenBtn(e, pos){
	var btn = e,
	tg = btn.getAttribute('data-info');

  document.querySelector('#'+tg+'').style.display = "block"
  //document.querySelector('#'+tg+''+ layercnt).setAttribute('tabindex','0')//.focus()
  popSet(document.querySelector('#'+tg+''), btn, null , true);
}

// 이벤트 호출용 함수
function layerOpen(e, pos, bgset){
	var tg = e,
	bgSet = bgset;
  document.querySelector('#'+tg+'').style.display = "block"
  document.querySelector('#'+tg+'').classList.add(onClass);
  //document.querySelector('#'+tg+''+layercnt).setAttribute('tabindex','0')//.focus()

  popSet(tg, null, null, null);
}

//닫기용 함수 - 레이어 전체
function layerClose(e){
  e.closest(".layer-pop").style.display = "none"

	//if(layerset != null) indexOnScroll(cntwrap);
	//else tabIndexOn(cntwrap);
	document.querySelector('.'+onClass).classList.remove(onClass);
	//layerset = null;
}

function layerAllClose () {
	var allLayer = document.querySelectorAll(layer)
	Array.prototype.forEach.call(allLayer, function(layerAll, idx){
		layerAll.style.display = "none"

	})
}

function layerOpenFunc (openBtns,callback) {
  layerBtn = document.querySelectorAll(openBtns)
  Array.prototype.forEach.call(layerBtn, function(btn, idx){
    btn.addEventListener("click",function (e) {
      var layer = btn.getAttribute("data-info")

	    layerAllClose()
      layerOpen(layer);
      e.currentTarget.classList.add(onClass)
      if(callback != null ) callback()
    })
  })
}
function layerCloseFunc (layer,closeCallback) {

  Array.prototype.forEach.call(document.querySelectorAll(".layer-close"), function(close, idx){
  close.addEventListener("click",function (e) {
      layerClose(e.target);
      if(closeCallback != null) closeCallback()
    })
  })
}

function layerFunc (openBtns,callback,closeCallback) {
  layerOpenFunc(openBtns,callback)
  layerCloseFunc(layer,closeCallback)
}
//생성용 레이어
function layerAlert(title, msg, btn, tg) {
	var body = document.querySelector('body');

	var btnTx = btn == null ? '확인' : btn;
	var layerCnt = '<div class="layer-pop alert" id="alertLayer">';
		layerCnt += '<div class="layer-cnt">';

		if(title != '') {
			layerCnt += '<div class="layer-top">';
			layerCnt += '<h2 class="layer-title">'+ title +'</h2>';
			layerCnt += '</div>';
		}

		layerCnt += '<div class="layer-mid">';
		layerCnt += '<p class="alert-msg">'+msg+'</p>';
		layerCnt += '<div class="layer-btn tr">';
		layerCnt += '<button type="button" class="btn btn-gray close-layer"><span>'+btnTx+'</span></button>';
		layerCnt += '</div>';
		layerCnt += '</div>';
		layerCnt += '<button type="button" class="btn-close close-layer"><span class="txt">팝업 닫기</span></button>';
		layerCnt += '</div>';
		layerCnt += '</div>';

	body.insertAdjacentHTML('beforeend', layerCnt);
	var alert = document.querySelector('#alertLayer'),
		close = alert.querySelector('#alertLayer .close-layer');

  document.querySelector('#alertLayer').style.display="block";
	close.focus();

	close.addEventListener('click', function(){

		alert.parentNode.removeChild(alert);
		if(tg != null) tg.focus();
	});
}

// 생성용 레이어
function layerConfirm(active, title, msg, btn1, btn2) {
	var body = document.querySelector('body');

	var btnCancel = btn1 == null ? '취소' : btn1,
		btnOk = btn2 == null ? '확인' : btn2;

	var layerCnt = '<div class="layer-pop confirm" id="ConfirmLayer">';
		layerCnt += '<div class="layer-cnt">';
		if(title != '') {
			layerCnt += '<div class="layer-top">';
			layerCnt += '<h2 class="layer-title">'+ title +'</h2>';
			layerCnt += '</div>';
		}
		layerCnt += '<div class="layer-mid">';
		layerCnt += '<p class="confirm-msg">'+msg+'</p>';
		layerCnt += '<div class="layer-btn tr">';
		layerCnt += '<button type="button" class="btn btn-gray close-layer"><span>'+ btnCancel +'</span></button>';
		layerCnt += '<button type="button" class="btn btn-bk close-layer btn-ok"><span>'+ btnOk +'</span></button>';
		layerCnt += '</div>';
		layerCnt += '</div>';
		layerCnt += '<button type="button" class="btn-close close-layer"><span class="txt">팝업 닫기</span></button>';
		layerCnt += '</div>';
		layerCnt += '</div>';

	body.insertAdjacentHTML('beforeend', layerCnt);
	var confirm  = document.querySelector('#ConfirmLayer'),
		cancel = confirm.querySelectorAll('#ConfirmLayer .close-layer'),
		okBtn 	   = confirm.querySelectorAll('#ConfirmLayer .btn-ok');

	document.querySelector('#ConfirmLayer').style.display="block";

  Array.prototype.forEach.call(cancel, function(cancelBtn, idx){
    cancelBtn.addEventListener('click', function(){
		confirm.parentNode.removeChild(confirm);
    });
})
Array.prototype.forEach.call(okBtn, function(ok, idx){
    ok.addEventListener('click', function(){
      confirm.parentElement.removeChild(confirm);
      if(typeof active === 'function') {
        active();
      }
    });
  })


}
