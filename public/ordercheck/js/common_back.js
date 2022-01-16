const plan = [
  {"idx":0,"plan":"month","title":"Starter","limitCount":40,"price":43000,"whiteLabel":0,"analystic":21500,"chat":21500},
  {"idx":1,"plan":"month","title":"Professional","limitCount":100,"price":75800,"whiteLabel":0,"analystic":60700,"chat":60700},
  {"idx":2,"plan":"month","title":"Team","limitCount":205,"price":125300,"whiteLabel":150400,"analystic":150400,"chat":150400},
  {"idx":3,"plan":"month","title":"Company","limitCount":410,"price":227200,"whiteLabel":454300,"analystic":340700,"chat":340700},

  {"idx":4,"plan":"year","title":"Starter","limitCount":40,"price":38000,"whiteLabel":0,"analystic":19000,"chat":19000},
  {"idx":5,"plan":"year","title":"Professional","limitCount":100,"price":68000,"whiteLabel":0,"analystic":54000,"chat":54000},
  {"idx":6,"plan":"year","title":"Team","limitCount":205,"price":112000,"whiteLabel":135000,"analystic":135000,"chat":135000},
  {"idx":7,"plan":"year","title":"Company","limitCount":410,"price":204000,"whiteLabel":408000,"analystic":306000,"chat":306000},
]

var passiveEvent = false;
try {
    var opts = Object.defineProperty({}, 'passive', {
        get: function () {
            passiveEvent = true;
        }
    });
    window.addEventListener("test", null, opts);
} catch (e) { }

// in my case I need both passive and capture set to true, change as you need it.
    passiveEvent = passiveEvent ? { capture: true, passive: true } : true;

//if you need to handle mouse wheel scroll
var supportedWheelEvent = string = "onwheel" in HTMLDivElement.prototype ? "wheel" :
    document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";


var agent = navigator.userAgent.toLowerCase();
if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
  //alert("인터넷 익스플로러 브라우저 입니다.");
  contentHeightFix(".subpage",".center-box")
} else {

}


//IE display: flex 지원용
function contentHeightFix (wrap, cntbox) {
  var page = document.querySelector(wrap)
  var contentbox = document.querySelector(cntbox)

  if(contentbox == null ) return
  if(contentbox.classList.contains("narrow")) {
    setTimeout(function() {
      page.style.height = page.clientHeight + "px"
      contentbox.style.height = contentbox.clientHeight + "px"
    },300)


  } else {
    page.style.height = page.clientHeight + "px"
    contentbox.style.height = contentbox.clientHeight + "px"
  }
}

// closest 기능 함수 설정
if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest =
  function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i,
          el = this;
      do {
          i = matches.length;
          while (--i >= 0 && matches.item(i) !== el) {};
      } while ((i < 0) && (el = el.parentElement));
      return el;
  };
}

// parents 기능 함수 - 부모요소 배열 반환
Element.prototype.parents = function(selector) {
	var elements = [];
	var elem = this;
	var ishaveselector = selector !== undefined;

	while ((elem = elem.parentElement) !== null) {
		if (elem.nodeType !== Node.ELEMENT_NODE) {
			continue;
		}

		if (!ishaveselector || elem.matches(selector)) {
			elements.push(elem);
		}
	}

	return elements;
};

//remove support
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
      if (this.parentNode) {
          this.parentNode.removeChild(this);
      }
  };
}



//메인 , 드롭 메뉴
function dropMenuOpen (btnName, dropBox, dropBtn , applyFunc,callback) {
  var btnMenu = document.querySelectorAll(dropBtn)
  clickAddClassFunc (btnName,dropBox,"on")

  Array.prototype.forEach.call(btnMenu, function(removeB, idx){
    removeB.addEventListener("click", function (e) {
      e.preventDefault()
      e.target.closest(".dropdown-box").classList.remove("on")
      if(applyFunc != null) {
          if(typeof applyFunc == "string") {

            Array.prototype.forEach.call(btnMenu, function(drop, idx){
              drop.classList.remove("on")
            })
            e.target.classList.add("on")
            e.target.closest(".dropdown-wrap").classList.add("active")

            e.target.closest(".dropdown-wrap").querySelector(applyFunc).innerText = e.target.innerText

            if(e.target.classList[1] != null) e.target.closest(".dropdown-wrap").querySelector(applyFunc).parentElement.classList.add(e.target.classList[1])
          } else if (typeof applyFunc == "function" ) {
            e.target.closest(".dropdown-wrap").classList.add("active")
            applyFunc(e.target)
          }

        }
    });
  })
  //clickRemoveClassFunc (btnMenu,dropBox,"on", function (target) {

  //

  //   target.closest(".dropdown-box").classList.remove("on")
  // })

}




//우측 슬라이드 메뉴
function slideMenu () {
  clickAddClassFunc (".btn-menu",".gnb-box","open")
  clickRemoveClassFunc (".close-box",".gnb-box","open")
}

slideMenu()

//좌측 슬라이드 메뉴
//클릭 이벤트 시, add class 용
function clickAddClassFunc (clickBtn, addArea,className,callback,typeone) {

  var btn = document.querySelectorAll(clickBtn);
  var wrap = document.querySelectorAll(addArea);
  Array.prototype.forEach.call(btn, function(b, idx){
    b.addEventListener("click", function (e) {
      e.preventDefault()
      if(typeone == true) {
        Array.prototype.forEach.call(btn, function(b2, idx2){
          wrap[idx2].classList.remove(className)
        })
      }

      wrap[idx].classList.toggle(className);
      if(callback != null) callback(e)
    });
  })
}

function clickRemoveClassFunc (clickBtn, removeArea,className,callback) {
  var btn;
  typeof clickBtn  == "string" ? btn =  document.querySelectorAll(clickBtn) : btn = clickBtn;

  Array.prototype.forEach.call(btn, function(b, idx){
    b.addEventListener("click", function (e) {
      e.preventDefault()
      e.target.closest(removeArea).classList.remove(className);
      if(callback != null) callback(e.currentTarget)
    });
  })
}


function selectInpRangeSet(sel,joinDay) {//셀렉트 박스 - 인풋 연계
  //셀렉트 박스 선택 값에 따라서 input value change
  var rangeSelect = document.querySelector(sel);
  var selectValue = rangeSelect.options[rangeSelect.selectedIndex].value
  var result = ''
  var inpTxt =  document.querySelector(".inp.inp-cal input")


  if(selectValue == 'today') result = getDate(0)
  else if(selectValue == 'yesterday') result = getDate("yesterday")
  else if(selectValue == 'lastweek') result = getDate("lastweek")
  else if(selectValue == 'thismonth') result = getDate("lastmonth")
  else if(selectValue == 'lastyear') result = getDate("lastyear")
  else if(selectValue == 'all') result = getDate("all",joinDay)
  else if(selectValue == 'custom') {
    result = getDate(0)
    document.querySelector(".inp.inp-cal input").focus()
  }
  inpTxt.value = result


  function getDate (gap,joinDay) {
    var now = new Date();
    var startDay, endDay;

    var nowYear = now.getFullYear(),
    nowMonth = now.getMonth() + 1,
    nowDate = now.getDate();

    nowMonth < 10 ? nowMonth = '0' + nowMonth :  nowMonth
    nowDate < 10 ? nowDate = '0' + nowDate : nowDate

    if(gap == 'yesterday') {
      startDay = new Date(now.setDate(now.getDate() - 1));
      endDay = new Date(now.setDate(now.getDate()));
    } else if(gap == 'lastweek') {
      //지난 주 월요일부터 금요일까지
      startDay = new Date(now.setDate(now.getDate() - (now.getDay() + 6) ));
      endDay = new Date(now.setDate(now.getDate() + 4 ));
    }  else if(gap == 'lastmonth') {
      startDay = new Date(now.getFullYear(),now.getMonth(),1)
      endDay = new Date(now)
    } else if(gap == 'lastyear') {
      startDay = new Date(now.setFullYear(now.getFullYear() - 1))
      endDay = new Date(now)
    } else if(gap == 'all') {
      var word = joinDay.split(".")
      startDay = new Date(word[0],word[1]-1,word[2])
      endDay = new Date(now)
    } else {
      startDay = new Date(now);
      endDay = new Date(now);
    }

    var startYear = startDay.getFullYear(),
    startMonth = startDay.getMonth() + 1,
    startDate = startDay.getDate();

    var endYear = endDay.getFullYear(),
    endMonth = endDay.getMonth() + 1,
    endDate = endDay.getDate();

    startMonth < 10 ? startMonth = '0' + startMonth :  startMonth
    startDate < 10 ? startDate = '0' + startDate : startDate

    endMonth < 10 ? endMonth = '0' + endMonth :  endMonth
    endDate < 10 ? endDate = '0' + endDate : endDate

    function getResult (gap) {
      result =  startYear +'.'+ startMonth +'.'+ startDate +' - '+ endYear +'.'+ endMonth +'.'+ endDate
      return result
    }

    return getResult(gap)
  }

}

// 체크 박스 모두 체크 기능 추가
function agreeChkFunc (wrap, chkAllId,callback) {
  var wrapArea = document.querySelector(wrap);
  var chk = wrapArea.querySelectorAll("input[type=checkbox]:not(#"+chkAllId+")")
  var chk_all = wrapArea.querySelector("#"+chkAllId+"")

  // 모두 체크/해제
  if(chk_all != null ) {
    chk_all.addEventListener("change",function(e){
      Array.prototype.forEach.call(chk, function(chk, idx){
            if(e.target.checked) chk.checked = true
            else chk.checked = false
            if(callback != null ) callback()
        })
    })
  }
  //개별 체크 박스 제어
  Array.prototype.forEach.call(chk, function(item, idx){
    item.addEventListener("change",function(e){
      var chk_num = wrapArea.querySelectorAll("input[type=checkbox]:not(#"+chkAllId+"):checked")
      if(chk_num.length == chk.length) chk_all.checked = true
      else chk_all.checked = false
      if(callback != null ) callback()
    })
  })
  if (document.querySelector(".btn-reset") != null) chkResetFunc(".btn-reset", ".manager-box input[type=checkbox]")
}

function chkResetFunc (btn,wrap) {
  var resetBtn = document.querySelector(btn);
  resetBtn.addEventListener("click",function(e){
    var obj = document.querySelectorAll(wrap);

    for (var i = 0; i < obj.length; i++) {
      obj[i].checked = false;
    }
  })
}

function btnRemoveFunc (wrap,btnClass) {
  var wrapArea = document.querySelector(wrap);
  var btns = wrapArea.querySelectorAll(btnClass)
  Array.prototype.forEach.call(btns, function(btn, idx){
    btn.addEventListener("click",function(e){
      var target = ''
      e.currentTarget.tagName == "button"? target = e.currentTarget : target = e.currentTarget.closest(btnClass)
      target.parentNode.removeChild (target)
    })
  })
}

function tabFunc (tabwrap,isFullSlider,callback) {
  setTimeout(function(e) {
  var wrap = document.querySelector(tabwrap)
  var tabBtn = wrap.querySelectorAll(".tab-btn")
  var slider = wrap.querySelector(".slider")
  var tabContent = document.querySelectorAll(".tab-content .content")
  var offsetPos = []

  if(callback!= null ) callback()

  // tab loading

  function getSlider (wrap,pos,idx) {
    if(isFullSlider) {
      slider.style.width =wrap.parentNode.clientWidth + "px"
      slider.style.left = pos[idx] +"px"

    } else {//로그인//담당 관리
      slider.style.width =wrap.offsetWidth + 2+ "px"
      slider.style.left = pos[idx]  + "px"
    }
  }


  Array.prototype.forEach.call(tabBtn, function(tab, idx){
    if(isFullSlider) {
      offsetPos.push(tabBtn[idx].parentElement.offsetLeft)
    } else {
      offsetPos.push(tabBtn[idx].offsetLeft)
    }

    if(tab.parentNode.classList.contains("on")) {
      getSlider(tab,offsetPos,idx)
      if(tabContent.length > 0) tabContent[idx].classList.add("active")
    } else {
      if(tabContent.length > 0) tabContent[idx].classList.remove("active")
    }
  //클릭 이벤트
    tab.addEventListener("click", function (e) {

    Array.prototype.forEach.call(tabBtn, function(tab2, idx){
      tab2.parentNode.classList.remove("on")
        if(tabContent.length > 0) tabContent[idx].classList.remove("active")
      })

      var id = e.currentTarget.getAttribute("data-tab");
      getSlider(e.currentTarget,offsetPos,idx)
      e.currentTarget.parentNode.classList.add("on")
      if(tabContent.length > 0) document.getElementById(id).classList.add("active")
      if(callback != null ) callback()

    })


  })
  },300)//setTimeout
}
function tabBasicFunc (tabwrap,clickBtn, contentCnt,callback) {
  var wrap = document.querySelector(tabwrap)
  var tabBtn = wrap.querySelectorAll(clickBtn)
  var tabContent = document.querySelectorAll(contentCnt)

  if(callback!= null ) callback()




  Array.prototype.forEach.call(tabBtn, function(tab, idx){
    if(tab.parentNode.classList.contains("on")) {
      if(tabContent.length > 0) tabContent[idx].classList.add("active")
    } else {
      if(tabContent.length > 0) tabContent[idx].classList.remove("active")
    }
  //클릭 이벤트
    tab.addEventListener("click", function (e) {

    Array.prototype.forEach.call(tabBtn, function(tab2, idx){
      tab2.parentNode.classList.remove("on")
        if(tabContent.length > 0) tabContent[idx].classList.remove("active")
      })

      var id = e.currentTarget.getAttribute("data-tab");
      e.currentTarget.parentNode.classList.add("on")
      if(tabContent.length > 0) document.getElementById(id).classList.add("active")
      if(callback != null ) callback()

    })


  })
}

function accordionFunc (btnName) {
  var title = document.querySelectorAll(btnName);

  for(var i = 0; i < title.length; i++){
    title[i].addEventListener("click", function(){
      var result = this.nextElementSibling;
      result.parentNode.classList.toggle("active");

    })
  }
}

// login chk
function inpActiveFunc(wrap,btnClass,maxIsTrue,requireIsTrue) {//기본 : value 에 하나이상 글자 입력시, maxIsTrue maxlength 값 과일치할때만 실행
  var scriptArea = document.querySelector(wrap);
  var input = scriptArea.querySelectorAll("input[type=text], input[type=tel],input[type=number],input[type=password]")
  var loginBtnFlag = [];
  var flag = '';

  if(requireIsTrue) input = scriptArea.querySelectorAll("input[type=text]:required, input[type=tel]:required,input[type=number]:required,input[type=password]:required")
  var loginBtns = scriptArea.querySelectorAll(btnClass)
  Array.prototype.forEach.call(loginBtns, function(login, idx){
    login.disabled = true
  })

  //value값에 따라 초기값 세팅
  Array.prototype.forEach.call(input, function(inp, idx){
    maxIsTrue == true ? flag = inp.value.length == inp.getAttribute("maxlength") : flag = inp.value.length > 0
    if(flag) loginBtnFlag.push(true)
    else loginBtnFlag.push(false)
  })

  loginBtnDisabled()
  inputValLengthChk ()

  function inputValLengthChk () {
    Array.prototype.forEach.call(input, function(inp, idx){
      inp.addEventListener("keyup", function (e) {
        var checkflag = inp.parentElement;
        maxIsTrue == true ? flag =( inp.value.length == inp.getAttribute("maxlength")) : flag = inp.value.length > 0

        if(flag) {
          loginBtnFlag[idx] = true;
          checkflag.classList.add("on")
        } else {
          loginBtnFlag[idx] = false;
          checkflag.classList.remove("on")
        }
        loginBtnDisabled()
      })

      // inp.addEventListener("change", function (e) {
      //   Array.prototype.forEach.call(input, function(inp, idx){
      //     maxIsTrue == true ? flag = inp.value.length == inp.getAttribute("maxlength") : flag = inp.value.length > 0
      //     if(flag) loginBtnFlag.push(true)
      //     else loginBtnFlag.push(false)
      //   })

      //   loginBtnDisabled()
      // })

    })

  }
  function loginBtnDisabled () {
    var loginBtn = scriptArea.querySelector(btnClass)
    if(loginBtn){
      var flag = loginBtnFlag.every(function(val) {return val == true})
      if(flag) loginBtn.disabled = false//둘다 인풋 체크
      else loginBtn.disabled = true
    }

  }

}
// login chk
function inpFileActiveFunc(wrap,btnClass) {//견적 업로드 수정 관련 input button 활성화

  var scriptArea = document.querySelector(wrap);
  var input = scriptArea.querySelectorAll("input[type=text], input[type=tel],input[type=number]")

  btnDisabled()

  Array.prototype.forEach.call(input, function(inp, idx){
    inp.addEventListener("change", function (e) {
      btnDisabled()
    })
    inp.addEventListener("input", function (e) {
      btnDisabled()
    })

  })

  function btnDisabled () {
    var loginBtnFlag = [];
    //value값에 따라 초기값 세팅
    Array.prototype.forEach.call(input, function(inp, idx){
      if(inp.value.length > 0) loginBtnFlag.push(true)
      else loginBtnFlag.push(false)
    })
    var button = scriptArea.querySelector(btnClass)
    var flag = loginBtnFlag.every(function(val) {return val == true})

    if(flag) button.disabled = false//둘다 인풋 체크
    else button.disabled = true
  }

}
// chk
function chkActiveFunc(wrap,allChk, btnClass) {
  var scriptArea = document.querySelector(wrap);
  var check = scriptArea.querySelectorAll("input[type=checkbox]:required")
  var checked = scriptArea.querySelectorAll("input[type=checkbox]:not(#"+allChk+"):required:checked")
  var confirmBtn = scriptArea.querySelector(btnClass)

  if(checked.length >= check.length) confirmBtn.disabled = false
  else confirmBtn.disabled = true;

  Array.prototype.forEach.call(check, function(chk, idx){
    chk.addEventListener("click", function (e) {
      checked = scriptArea.querySelectorAll("input[type=checkbox]:not(#"+allChk+"):checked")
      if(checked.length == check.length -1) confirmBtn.disabled = false
      else confirmBtn.disabled = true;
    })
  })
}

/* input password/text 전환 */
function inpTypeSwitch () {
  clickAddClassFunc (".btn-pw-show",".btn-pw-show","active", function (e) {
    var inputPw = e.currentTarget.previousElementSibling;
    var flag = inputPw.getAttribute("type")
    flag == "text"? inputPw.setAttribute("type","password") : inputPw.setAttribute("type","text")
  })
}

function autoHypenTelFunc (inputID,callback) {//매개변수 설명 : input ID / 하이픈 적용되어야하는 텀 (number or array)
  var input = document.querySelector("#"+inputID)
  if(input){
    input.addEventListener("keyup",function(e){
      var _val = this.value.trim()
      this.value = autoHypenTel(_val,callback,e.currentTarget)
  
    })
    //휴대폰용 하이픈 자동 추가
    function autoHypenTel (str,callback,target) {
      str = str.replace(/[^0-9]/g,'')
      var tmp = '';
  
      if(callback != null) callback(target)
  
      if (str.length < 4) {
        return str;
      } else if (str.length < 7) {
        tmp += str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3);
        return tmp;
      } else if (str.length < 11) {
        tmp += str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3, 3);
        tmp += '-';
        tmp += str.substr(6);
        return tmp;
      } else {
        tmp += str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3, 4);
        tmp += '-';
        tmp += str.substr(7);
  
        return tmp;
      }
  
    }
  }
  

}


function dropMenuShowHide (wrap,clickBtn,menuList ) {
  var dropWrap = document.querySelector(wrap)
  var btn = dropWrap.querySelector(clickBtn)
  var menu = document.querySelector(menuList)
  var menuBtn = menu.querySelectorAll(".btn-member-drop")
  var company = document.querySelector(".company")
  var desc = document.querySelector(".desc")
  var price = document.querySelector(".price var")

  btn.classList.add("active")
  //event
  btn.addEventListener("click",function(e){
    if(e.target.classList.contains("open")) {
      menuClose ()
      e.currentTarget.classList.add("active")
    } else {

      e.currentTarget.classList.remove("active")
      menuOpen ()
      dimCreate ()
    }
  })
  Array.prototype.forEach.call(menuBtn, function(btn, idx){
    btn.addEventListener("click",function(e){
      clickResultApply (e)
      menuClose ()
    })
  })

  function menuClose () {
    btn.classList.remove("open")
    var dim = document.querySelector(".dim")
    dim.parentElement.removeChild(dim)
    dimRemove()
  }

  function menuOpen () {
    btn.classList.add("open")
  }

  function clickResultApply (e) {
    e.currentTarget.tagName != "BUTTON"? target = e.currentTarget.closest("button") : target = e.currentTarget

    var selCompany = target.querySelector(".company").innerText
    var selDesc = target.querySelector(".desc").innerText
    var selPrice = target.querySelector(".price var").innerText

    var planIdx = target.querySelector(".planIdx").value
    console.log(planIdx)
    $("#planIdx").val(planIdx)
    $("#service02Price").text(Number(plan[planIdx].chat).toLocaleString());
    $("#service03Price").text(Number(plan[planIdx].analystic).toLocaleString());

    if(planIdx == 2 || planIdx == 3 || planIdx == 6 || planIdx == 7){
      $("#service01").attr("disabled",false)
      let _html = '₩ <var>'+Number(plan[planIdx].whiteLabel).toLocaleString()+'</var> <span class="unit">월</span>'
      $("#service01Price").html(_html)
    }else{
      $("#service01").attr("disabled",true)
      let _html = '팀 플랜부터 가능'
      $("#service01Price").html(_html)
    }

    let _whiteLabelChecked = $("input:checkbox[id='service01']").is(":checked")
    let _chatChecked = $("input:checkbox[id='service02']").is(":checked")
    let _analysticChecked = $("input:checkbox[id='service03']").is(":checked")

    let _chat = _chatChecked == true ? plan[planIdx].chat : 0;
    let _analystic = _analysticChecked == true ? plan[planIdx].analystic : 0;
    let _whiteLabel = _whiteLabelChecked == true ? plan[planIdx].whiteLabel : 0;
    let _price = plan[planIdx].price;

    let _resultPrice = Number(_chat + _analystic + _whiteLabel + _price);
    $("#resultPrice").text(Number(_resultPrice).toLocaleString())


    company.innerText = selCompany
    desc.innerText = selDesc
    price.innerText = selPrice

    btn.classList.add("active")
  }
  function dimCreate () {
      var dimElement = document.createElement("div")
      dimElement.classList.add("dim")
      dropWrap.appendChild(dimElement)
  }
  function dimRemove () {
    var dim = document.querySelector(".dim")
    //event
    if (dim != null) {
      dim.addEventListener("click",function(e){
        dim.parentElement.removeChild(dim)
        menuClose ()
      })

    }
  }

}

//메인 , 드롭 메뉴
function dropFormMenuOpen (date) {
  // 드롭다운 오픈 이벤트
  document.querySelector('.estimate-list').addEventListener('click', function (e) {
    var btnEl = e.target && e.target.closest('.btn-form-menu');
    if(!btnEl) return;

    var dropdownBoxes = e.currentTarget.querySelectorAll('.dropdown-box');
    if(btnEl.nextElementSibling.classList.contains('on')) {
      btnEl.nextElementSibling.classList.remove('on');

    }
    else {
      Array.prototype.forEach.call(dropdownBoxes, function(el) {
        el.classList.remove('on');
      })
      btnEl.nextElementSibling.classList.add('on');
    }
  });

  // 드롭다운 메뉴 클릭이벤트
  document.querySelector('.estimate-list').addEventListener('click', function(e) {
    var menuEl = e.target && e.target.closest('.btn-drop-menu');
    var title;
    if(!menuEl) return;

    switch(true) {
      case menuEl.classList.contains('copy'):
        var content = e.target.closest('.btn-form').querySelector('.txt').textContent;
        var num = 0
        Array.prototype.forEach.call(document.querySelectorAll('.btn-form .txt'), function(el) {
          if(el.innerText.split("(")[0].trim() == content.split("(")[0].trim()) num++
          title =  content.split("(")[0].trim() +"("+num+")"

        })
        var today = new Date()
        var date = today.getFullYear()+"."+ Number(today.getMonth() + 1) + "." + (today.getDate()<10? "0"+ today.getDate() :today.getDate())
        copyCard(title,date);
        break;

      case menuEl.classList.contains('delete'):
        // 삭제
        e.target.closest(".btn-form").closest("li").parentElement.removeChild(e.target.closest(".btn-form").closest("li"))
        break;

      case menuEl.classList.contains('open-layer'):
        // 레이어 오픈
        break;
    }
    Array.prototype.forEach.call(document.querySelectorAll('.dropdown-box'), function(el) {
      el.classList.remove('on');
    })
  })

  // 카드복제
  function copyCard(content,date) {
    var cardHTML = '<li>\
      <div class="btn-form">\
        <span class="txt" contenteditable="true">' + content + '</span>\
        <span class="date" contenteditable="true">' + date + '</span>\
        <div class="dropdown-wrap">\
          <button type="button" class="btn-form-menu"><span>메뉴열기</span>\</button>\
          <div class="dropdown-box">\
            <ul>\
              <li><a href="#" class="btn-drop-menu copy"><span>복제하기</span></a></li>\
              <li><a href="#" class="btn-drop-menu delete"><span>삭제하기</span></a></li>\
              <li><a href="#" class="btn-drop-menu open-layer" data-info="layer-info-url"><span>링크확인</span></a></li>\
            </ul>\
          </div>\
        </div>\
      </div>\
    </li>'

    var formList = document.querySelector('.estimate-list');
    formList.insertAdjacentHTML('beforeend', cardHTML);
  }
}



function formSideFunc (btn,wrap) {
  var formBtn = document.querySelectorAll(btn)
  var sideLeft = document.querySelector(wrap+".left")
  var sideRight = document.querySelector(wrap+".right")
  Array.prototype.forEach.call(formBtn, function(btn, idx){
    btn.addEventListener("click",function(e) {
      var directionFlag = e.currentTarget.getAttribute("data-direction")
      if(directionFlag =="left") sideLeft.classList.toggle("open")
      else if(directionFlag =="right") sideRight.classList.toggle("open")

    })
  })
}

function inpEmptyFunc (ele) {
  var input = document.querySelectorAll(ele)
  Array.prototype.forEach.call(input, function(inp, idx){
    inp.addEventListener("focus",function(e) {
      if(e.currentTarget.value != '') e.currentTarget.value = ''

    })
  })
}

function layerLoadingByBtn (b,layer) {
  var clickBtn = document.querySelectorAll(b)

  Array.prototype.forEach.call(clickBtn, function(btn, idx){
    btn.addEventListener("click",function(e) {
      layerOpen(layer)

    })
  })
}
//고객관리 목록 상세에서 사용
layerLoadingByBtn (".tab-radio-box input[name='consult'] + label","layer-revise")

function fileUpload (fileInp) {
  var fileInput = document.querySelectorAll(fileInp)
  var btnRemove = ''

  if (fileInput.length == 0) return
  Array.prototype.forEach.call(fileInput, function(inp, idx){
    btnRemove = inp.nextElementSibling
    inp.addEventListener("change",function(e){
      var fileName = e.currentTarget.files[0].name
      e.currentTarget.previousElementSibling.value = fileName

      if(e.currentTarget.value < 1) inp.nextElementSibling.style.display = "none"
      else inp.nextElementSibling.style.display = "block"
      changeEvt(inp.previousElementSibling)
    });
  })

  btnRemove.addEventListener("click",function(e) {
    e.currentTarget.previousElementSibling.value = ''
    e.currentTarget.previousElementSibling.previousElementSibling.value = ''
    e.currentTarget.style.display = "none"
    changeEvt(e.currentTarget.previousElementSibling.previousElementSibling)
  })

}
fileUpload("input[type='file']")

function changeEvt (element) {
  if ("createEvent" in document) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("change", false, true);
    element.dispatchEvent(evt);
  } else{
    element.fireEvent("onchange");
  }
}
function keyUpEvt (element) {
  var evt = document.createEvent("HTMLEvents");
  evt.initEvent("change", false, true); // adding this created a magic and passes it as if keypressed
  element.dispatchEvent(evt);
  return false
}

function inpChangeFunc () {
  $(".inp-select").on('change', "select", function() {
    $(this).addClass("active").next().addClass("active")

    if($(this).attr("name") == "range") selectInpRangeSet (".inp-select select[name=range]","2021.01.22") //두번째 매개변수에 가입일 전달해야함
  });
}
inpChangeFunc()

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberToKorean(number){
  var inputNumber  = number < 0 ? false : number;
  var unitWords    = ['', '만', '억', '조', '경'];
  var splitUnit    = 10000;
  var splitCount   = unitWords.length;
  var resultArray  = [];
  var resultString = '';

  for (var i = 0; i < splitCount; i++){
    var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
    unitResult = Math.floor(unitResult);
    if (unitResult > 0){
        resultArray[i] = unitResult;
    }
  }

  for (var i = 0; i < resultArray.length; i++){
    if(!resultArray[i]) continue;
    resultString = String(resultArray[i]) + unitWords[i] + resultString;
  }

  return resultString;
}

function autoCommasFunc (inputName,callback) {
  var input = document.getElementsByName(inputName)

  Array.prototype.forEach.call(input, function(inp, idx){
    inp.closest(".inp").nextElementSibling.style.display= "none"
    inp.addEventListener("keyup",function(e){
      var _val = e.currentTarget.value.replace(/[^0-9]/g,'')
      this.value = numberWithCommas(_val);
      e.currentTarget.closest(".inp").nextElementSibling.style.display= "block"

      if(inp.value.length < 1) e.currentTarget.closest(".inp").nextElementSibling.querySelector(".tx-org").innerText = "0원"
      else e.currentTarget.closest(".inp").nextElementSibling.querySelector(".tx-org").innerText =numberToKorean(_val) + "원"
    })

  })
}


function inputPageSelect(selName,list,card) {
  var select = document.getElementsByName(selName)
  Array.prototype.forEach.call(select, function(sel, idx){

    var wrap =  sel.closest(".content")
    var listWrap = wrap.querySelector(list)
    var cardWrap = wrap.querySelector(card)
    if (sel.value == "list") {
      cardWrap.style.display = "none"
      listWrap.style.display = "block"
    } else {
      cardWrap.style.display = "flex"
      listWrap.style.display = "none"
    }

    $(".inp-select").on('change', "select[name='"+selName+"']", function() {
      var wrap =  sel.closest(".content")
      var listWrap = wrap.querySelector(list)
      var cardWrap = wrap.querySelector(card)
      if (sel.value == "list") {
        cardWrap.style.display = "none"
        listWrap.style.display = "block"
      } else {
        cardWrap.style.display = "flex"
        listWrap.style.display = "none"
      }

    })

  })

}

function orderCheckOnOff (chk,tg) {
  var chkArea = document.querySelectorAll(chk);
  var tgArea = document.querySelectorAll(tg)
  Array.prototype.forEach.call(chkArea, function(check, idx){
    check.addEventListener("click",function(e){
      Array.prototype.forEach.call(tgArea, function(target, idx){
        if(e.currentTarget.checked) target.style.display="block"
        else target.style.display="none"
      })
    })
  })
}

function draggableSlider (sliderWrap) {
  var slider = document.querySelector(sliderWrap);
  var sliderGrabbed = false

  slider.addEventListener("mousedown",function(e){
    sliderGrabbed = true;
    slider.style.cursor = "grabbing"
  })

  slider.addEventListener("mouseup",function(e){
    sliderGrabbed = false;
    slider.style.cursor = "grab"
  })

  slider.addEventListener("mouseleave",function(e){
    sliderGrabbed = false;
    slider.style.cursor = "grab"
  })

  slider.addEventListener("mousemove",function(e){
    if(sliderGrabbed) {
      if(e.target.classList[0] == "form-temp-box" || e.target.classList[0] == "template") {
        slider.parentElement.scrollLeft -= e.movementX
      }

    }
  })

  slider.addEventListener("wheel",function(e){
    e.preventDefault()

    if(e.target.classList[0] == "form-temp-box" || e.target.classList[0] ==  "form-temp-list") {
      slider.scrollLeft += e.deltaY
    } else if(e.target.classList[0] == "btn-drop-menu") {
      e.target.closest("ul").scrollTop += e.deltaY
    } else {
      e.target.closest("ul").scrollTop += e.deltaY
    }
  },{passive: false})

}


function pageInfoRemove () {

  var wrap = document.querySelector(".page-info")
  wrap.addEventListener("click" ,function(e){
    if(e.target.className =="btn-close") {
      e.target.closest("li").parentElement.removeChild(e.target.closest("li"))
    }
  })

}



function ToastFunc(btn, msg, time) {
  var button = document.querySelector(btn)
  var toastCont = document.querySelector("#toast")

  var randomMsg = msg

  button.addEventListener("click", createToast)

  function createToast () {
    var toastEl = document.createElement("div")
    toastEl.classList.add("toast")
    toastEl.innerText = msg
    toastCont.appendChild(toastEl)

    setTimeout(function () {
      toastEl.classList.add("active")
    },10)
    setTimeout(function () {
      toastEl.remove()
      toastEl.classList.remove("active")
    },time)
  }

}

function templateFunc() {
  tempBoxOn()
  formRemove()
}
function formRemove() {
  var template = document.querySelectorAll(".template .btn-close")
  Array.prototype.forEach.call(template, function(temp, idx){
    temp.addEventListener("click",function(e){
      e.currentTarget.closest(".template").parentElement.parentElement.removeChild(e.currentTarget.closest(".template").parentElement)
    })

  })
}

function tempBoxOn () {
  var btn = document.querySelectorAll(".template .temp-box");

  Array.prototype.forEach.call(btn, function(b, idx){
    b.addEventListener("click", function (e) {
      e.preventDefault()
      if(e.target.classList.contains("temp-box")) {
        Array.prototype.forEach.call(btn, function(b2, idx2){
          btn[idx2].classList.remove("on")
        })
        btn[idx].classList.toggle("on");

      }
    })
  })
}

function pageInit () {  //모든 페이지용 함수
  clickAddClassFunc(".btn-side-open",".sidebar","open")//사이드 메뉴
  dropMenuOpen ('.header .btn-drop','.header .dropdown-box','.header .btn-drop-menu','.name')//상단 드롭 메뉴
  dropMenuOpen ('.dropdown-wrap.type02','.dropdown-wrap.type02 .dropdown-box','.dropdown-wrap.type02 .btn-drop-menu', ".txt")//상단 드롭 메뉴
  dropMenuOpen ('.dropdown-wrap.type03','.dropdown-wrap.type03 .dropdown-box','.dropdown-wrap.type03 .btn-drop-menu', ".txt")//상단 드롭 메뉴

}


