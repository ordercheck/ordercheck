let countInterval;
let authValid = false;
let time = 1000 * 60 * 2;
let authCode = '0000';
let planType = 'month'
let cardType = 'personal'

$(document).ready(function(){
    if(window.location.pathname == "/subscribe/step1"){
        $(".year").hide()
        $("#service01, #service02, #service03").on("click",function(){
            calPrice()
        })
    }else if(window.location.pathname == "/subscribe/step2"){
        let pt = localStorage.getItem("pt");
        let HOST = $("#HOST").val()
        $.ajax({url:HOST+"api/decode/token/data", method:"post",data:{token:pt},success:function(json){
            let _data = json.data;
            $(".free_plan").text(_data.free_plan);
            $(".result_price").text(_data.result_price)
        },error:function(err){
            console.log(err)
        }})
        $("#user_card01-1").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 4){
                $("#user_card01-2").focus()
            }
        })
        $("#user_card01-2").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 4){
                $("#user_card01-3").focus()
            }
        })
        $("#user_card01-3").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 4){
                $("#user_card01-4").focus()
            }
        })
        
        $("#user_card02-1").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 4){
                $("#user_card02-2").focus()
            }
        })
        $("#user_card02-2").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 4){
                $("#user_card02-3").focus()
            }
        })
        $("#user_card02-3").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 4){
                $("#user_card02-4").focus()
            }
        })
        $("#personal_user_date").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 2){
                $("#personal_user_date02").focus()
            }
        })
        $("#company_user_date").on("keyup",function(){
            console.log($(this).val().length)
            if($(this).val().length == 2){
                $("#company_user_date02").focus()
            }
        })
    }
})

function paddedFormat(num) {
    return num < 10 ? "0" + num : num; 
}

function startCountDown(duration, element) {

    let secondsRemaining = duration;
    let min = 0;
    let sec = 0;

    countInterval = setInterval(function () {

        min = parseInt(secondsRemaining / 60);
        sec = parseInt(secondsRemaining % 60);

        element.textContent = `${paddedFormat(min)}:${paddedFormat(sec)}`;

        secondsRemaining = secondsRemaining - 1;
        if (secondsRemaining < 0) { 
            authCode = '----'
            clearInterval(countInterval) 
        };

    }, 1000);
}

function setTimer () {
    clearInterval(countInterval)
    let time_minutes = 2; // Value in minutes
    let time_seconds = 0; // Value in seconds

    let duration = time_minutes * 60 + time_seconds;

    element = document.querySelector('#count-down-timer');
    element.textContent = `${paddedFormat(time_minutes)}:${paddedFormat(time_seconds)}`;

    startCountDown(--duration, element);
};

function doLogin(){
    console.log("로그인 진행...")
    $(".account-warning").addClass('hide');
    let user_phone = $("#user_phone").val();
    let user_password = $("#user_password").val();
    let HOST = $("#HOST").val()
    $.ajax({url:HOST+"api/login", method:"post",data:{user_phone,user_password},success:function(json){
        if(json.success == 200){
            localStorage.setItem("ut",json.token)
            alert("로그인 성공")
        }else{
            $(".account-warning").removeClass('hide');
        }
    },error:function(err){
        console.log(err)
    }})
}



function doJoin(){

    $(".warning-phone01").hide()
    $(".warning-phone02").hide()
    $(".warning-name").hide()
    $(".warning-password01").hide()
    $(".warning-password02").hide()
    $(".warning-email01").hide()
    $(".warning-email02").hide()


    let user_name = $("#user_name").val()
    let user_phone = $("#user_phone").val()
    let user_email = $("#user_email").val()
    let user_password = $("#user_password").val()
    console.log(user_password)
    chkPhone(user_phone)
    if(user_name == ''){
        $(".warning-name").show()
        return false
    }
    if(!chkPhone(user_phone)){
        $(".warning-phone02").show()
        return false;
    }
    if(!chkPwd(user_password)){
        // alert("비밀번호는 영문,숫자,특수문자 포함 8~16글자 이상 입니다.");
        $(".warning-password02").show()
        return false;
   }
   if(!chkEmail(user_email)){
        $(".warning-email01").show()
        return false;
   }

   let HOST = $("#HOST").val()
   let code = randomNumber4();
   let message = `[오더체크]\n인증번호:${code}`
   $.ajax({url:HOST+"api/join/check", method:"post", data:{user_phone,user_email,message},success:function(json){
    if(json.success == 200){
        console.log("가입 가능 계정")
        $("#target_phone").text(user_phone)
        //authCode 설정
        authCode = code;
        setTimer()
        $(".layer-pop").show()
    }else{
        if(json.type == "phone"){
            $(".warning-phone01").show()
        }else if(json.type == "email"){
            $(".warning-email02").show()
        }else if(json.type == "code"){
            alert("인증문자 발송에 문제가 발생했습니다.\n"+json.error)
        }
    }
   },error:function(err){
       console.log(err)
   }})
}

function reAuth(){
    //authCode 재설정
    let HOST = $("#HOST").val()
    let user_phone = $("#user_phone").val()
    let code = randomNumber4();
    let message = `[오더체크]\n인증번호:${code}`
    $.ajax({url:HOST+"api/send/sms", method:"post", data:{user_phone,message},success:function(json){
     if(json.success == 200){
         authCode = code;
         setTimer()
     }else{
        if(json.type == "code"){
            alert("인증문자 발송에 문제가 발생했습니다.\n"+json.error)
        }
     }
    },error:function(err){
        console.log(err)
    }})
   
}

function doAuth(){
    $(".warning-auth").hide()
    let user_auth = $("#user_auth").val();
    if(user_auth == authCode){
        let user_name = $("#user_name").val()
        let user_phone = $("#user_phone").val()
        let user_email = $("#user_email").val()
        let user_password = $("#user_password").val()
        let HOST = $("#HOST").val()
        $.ajax({url:HOST+"api/create/token", method:"post", data:{user_name,user_phone,user_email,user_password},success:function(json){
            if(json.success == 200){
                console.log(json.token)
                location.href = '/join/agree?token='+json.token
            }else{
              
            }
           },error:function(err){
               console.log(err)
           }})
    }else{
        $(".warning-auth").show()
    }
}
function doAgree(){
    let token = $("#TOKEN").val();
    let agree01 = $('input:checkbox[id="agree01"]').is(":checked")
    let agree02 = $('input:checkbox[id="agree02"]').is(":checked")
    let agree03 = $('input:checkbox[id="agree03"]').is(":checked")

    if(agree01 && agree02 && agree03){
        localStorage.setItem("ut",token)
        location.href = "/join/complete?token="+token
    }else{
        alert("필수 동의를 진행해주세요")
    }

 
}

function chkPwd(str){
    var pattern_num = /[0-9]/;	// 숫자 
    var pattern_eng = /[a-zA-Z]/;	// 문자 
    var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수문자

    //pattern_OOO.test(str) => true면 해당 문자 있음, false면 해당 문자 없음!
    if( pattern_num.test(str) && pattern_eng.test(str) && pattern_spc.test(str) && str.length > 7 && str.length < 17){
        return true;
    }else{
        return false;
    }
 }
 function chkDomain(str){
    var pattern_num = /[0-9]/;	// 숫자 
    var pattern_eng = /[a-zA-Z]/;	// 문자

    //pattern_OOO.test(str) => true면 해당 문자 있음, false면 해당 문자 없음!
    if( pattern_num.test(str) && pattern_eng.test(str) && str.length > 3 && str.length < 20){
        return true;
    }else{
        return false;
    }
 }

 function chkPhone(str){
    var phoneNum = str;
    var patternPhone = /01[016789]-[^0][0-9]{2,3}-[0-9]{3,4}/;
    if(!patternPhone.test(phoneNum))
    {
        return false
    }

    return true
 }

function chkEmail(str){
    var regExpEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
   
    if(str.length < 6 || !regExpEmail.test(str))
    {
        return false
    }  
    return true

}

function changePlan(type){
    if(type == 'month'){
        planType = type
        $(".button-0").click()
        $(".month").show();
        $(".year").hide();
    }else if(type == 'year'){
        planType = type
        $(".button-4").click()
        $(".month").hide();
        $(".year").show();
    }
}

function getNowTimeJoin(){
    let today = new Date();
    let mo = Number(today.getMonth() + 1) > 9 ? Number(today.getMonth() + 1) : "0" + Number(today.getMonth() + 1);
    let d = Number(today.getDate()) > 9 ? Number(today.getDate()) : "0" + Number(today.getDate());

    return Number(today.getFullYear()) + '.' + mo + '.' + d
}
function getNowTimeJoinDate(_d){
    let today = new Date(_d);
    let mo = Number(today.getMonth() + 1) > 9 ? Number(today.getMonth() + 1) : "0" + Number(today.getMonth() + 1);
    let d = Number(today.getDate()) > 9 ? Number(today.getDate()) : "0" + Number(today.getDate());

    return Number(today.getFullYear()) + '.' + mo + '.' + d
}

function randomNumber4(){
    var chars = "0123456789";
    var string_length = 4;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

function calPrice(){
    let planIdx = $("#planIdx").val();
    console.log(planIdx)
    let _whiteLabelChecked = $("input:checkbox[id='service01']").is(":checked")
    let _chatChecked = $("input:checkbox[id='service02']").is(":checked")
    let _analysticChecked = $("input:checkbox[id='service03']").is(":checked")

    let _chat = _chatChecked == true ? plan[planIdx].chat : 0;
    let _analystic = _analysticChecked == true ? plan[planIdx].analystic : 0;
    let _whiteLabel = _whiteLabelChecked == true ? plan[planIdx].whiteLabel : 0;
    let _price = plan[planIdx].price;

    let _resultPrice = Number(_chat + _analystic + _whiteLabel + _price);
    $("#resultPrice").text(Number(_resultPrice).toLocaleString())
}

function openMemberInfo(){
    localStorage.removeItem("pt")
    console.log(getNowTimeJoin())
    console.log(getNowTimeJoinDate(addDays(getNowTimeJoin(),14)))
    let start_plan = getNowTimeJoin();
    let free_plan = getNowTimeJoinDate(addDays(getNowTimeJoin(),14))
    let expire_plan = planType == 'month' ? getNowTimeJoinDate(addDays(free_plan,30)) : getNowTimeJoinDate(addDays(free_plan,365))
    let result_price = $("#resultPrice").text();

    let planIdx = $("#planIdx").val();

    let whiteLabelChecked = $("input:checkbox[id='service01']").is(":checked")
    let chatChecked = $("input:checkbox[id='service02']").is(":checked")
    let analysticChecked = $("input:checkbox[id='service03']").is(":checked")


    $(".start_plan").text(start_plan)
    $(".free_plan").text(free_plan)
    $(".expire_plan").text(expire_plan)
    $(".result_price").text(result_price)

    let HOST = $("#HOST").val()
    $.ajax({url:HOST+"api/create/token/data", method:"post",data:{start_plan,free_plan,expire_plan,result_price,planIdx,whiteLabelChecked,chatChecked,analysticChecked},success:function(json){
        if(json.success == 200){
            localStorage.setItem("pt",json.token)
            $("#layer-member-info").show()
        }else{
            alert("문제발생")
        }
    },error:function(err){
        console.log(err)
    }})
}

function goSubscribeStep02(){
    location.href = '/subscribe/step2'
}

function changeCardType(type){
    cardType = type;
}

function goSubscribeStep03(){
    localStorage.removeItem("ct")
    let card01,card02,card03,card04,date01,date02,pw,birth,email;

    $(".personal-card-warning").hide()
    $(".personal-expire-warning").hide()
    $(".personal-pw-warning").hide()
    $(".personal-birth-warning").hide()
    $(".personal-email-warning").hide()
    $(".company-card-warning").hide()
    $(".company-expire-warning").hide()
    $(".company-pw-warning").hide()
    $(".company-birth-warning").hide()
    $(".company-email-warning").hide()

    if(cardType == 'personal'){
        card01 = $("#user_card01-1").val()
        card02 = $("#user_card01-2").val()
        card03 = $("#user_card01-3").val()
        card04 = $("#user_card01-4").val()
        date01 = $("#personal_user_date").val();
        date02 = $("#personal_user_date02").val();
        pw = $("#personal_user_pw").val();
        birth = $("#personal_user_birth").val();
        email = $("#personal_user_email").val();
  
    }else{
        card01 = $("#user_card02-1").val()
        card02 = $("#user_card02-2").val()
        card03 = $("#user_card02-3").val()
        card04 = $("#user_card02-4").val()
        date01 = $("#company_user_date").val();
        date02 = $("#company_user_date02").val();
        pw = $("#company_user_pw").val();
        birth = $("#company_user_birth").val();
        email = $("#company_user_email").val();
    }

    let card_full = card01 + '' + card02 + '' + card03 + '' + card04;
    if(card_full.length < 15){
        cardType == 'personal' ?  $(".personal-card-warning").show() : $(".company-card-warning").show()
        return false;
    }
    if(date01.length !== 2){
        cardType == 'personal' ?  $(".personal-expire-warning").show() : $(".company-expire-warning").show()
        return false;
    }
    
    if(pw.length !== 2){
        cardType == 'personal' ?  $(".personal-pw-warning").show() : $(".company-pw-warning").show()
        return false;
    }
    if(cardType == 'personal'){
        if(date02.length !== 4){
            $(".personal-expire-warning").show()
            return false;
        }
        if(birth.length !== 6){
            $(".personal-birth-warning").show()
            return false;
        }
    }else{
        if(date02.length !== 4){
            $(".company-expire-warning").show()
            return false;
        }
        if(birth.length !== 10){
            $(".company-birth-warning").show()
            return false;
        }
    }

    if(!chkEmail(email)){
        cardType == 'personal' ?  $(".personal-email-warning").show() : $(".company-email-warning").show()
        return false;
    }

    let card_number = card_full;
    let expired_date = date01+""+date02;
    let card_pw = pw;
    let card_birth = birth;
    let card_email = email;
    let HOST = $("#HOST").val()
    $.ajax({url:HOST+"api/create/token/data", method:"post",data:{card_number,expired_date,card_pw,card_birth,card_email},success:function(json){
        if(json.success == 200){
            localStorage.setItem("ct",json.token)
            location.href = '/subscribe/step3'
        }else{
            alert("문제발생")
        }
    },error:function(err){
        console.log(err)
    }})
}

let doRegistCompanyFlag = false
function doRegistCompany(){

    if(doRegistCompanyFlag){
        alert("잠시만 기다려주세요.")
        false;
    }
    $(".company-name-wraning").hide()
    $(".company-name-duplicate-wraning").hide()
    $(".domain-valid-wraning").hide()
    $(".domain-duplicate-wraning").hide()

    let hidx;
    let ut = localStorage.getItem("ut")
    let ct = localStorage.getItem("ct")
    let pt = localStorage.getItem("pt")
    let company_name = $("#user_company").val();
    let company_subdomain = $("#user_companyUrl").val();

    if(!chkDomain(company_subdomain)){
        $(".domain-valid-wraning").show()
        doRegistCompanyFlag = false
        return false;
    }
    let HOST = $("#HOST").val()
    doRegistCompanyFlag = true
    $.ajax({url:HOST+"api/company/check", method:"post",data:{ut,ct,pt,company_name,company_subdomain},success:function(json){
        if(json.success == 200){
            doRegistCompanyFlag = false
            localStorage.removeItem("ct")
            localStorage.removeItem("pt")
            location.href='/subscribe/complete'
        }else{
            doRegistCompanyFlag = false
            if(json.type == 'name'){
                $(".company-name-duplicate-wraning").show()
            }else if(json.type == 'domain'){
                $(".domain-duplicate-wraning").show()
            }else if(json.type == 'double'){
                alert("이 휴대폰 번호의 계정은 이미 회사 계정을 생성하였습니다.")

            }else{
                alert("문제가 발생했습니다. 처음 단계로 돌아갑니다.")
            }
        }
    },error:function(err){
        console.log(err)
    }})

}


function toastPop(btn, msg, time) {
    var button = document.querySelector(btn)
    var toastCont = document.querySelector("#toast")
  
    var randomMsg = msg
  
    button.addEventListener("click", createToast)
  
    function createToast () {
      var toastEl = document.createElement("div")
      toastEl.classList.add("toast")
      toastEl.innerText = msg
      toastCont.appendChild(toastEl)
  
      toastEl.classList.add("active")
      setTimeout(function () {
        toastEl.remove()
        toastEl.classList.remove("active")
      },time)
    }
  }

function passwordGetAuth(){
    $(".phone-warning").hide()
    $(".auth-warning").hide()

    let user_phone = $("#user_phone").val()
    let HOST = $("#HOST").val()
    $.ajax({url:HOST+"api/phone/check", method:"post",data:{user_phone},success:function(json){
        if(json.success == 200){
            toastPop(".pop-toast",'인증번호가 문자로 전송되었습니다',1000)
            let code = randomNumber4();
            let message = `[오더체크]\n인증번호:${code}`
            $.ajax({url:HOST+"api/send/sms", method:"post", data:{user_phone,message},success:function(json){
                if(json.success == 200){
                    authCode = code;
                    setTimer()
                    $(".auth-time").show()
                }else{
                    if(json.type == "code"){
                        alert("인증문자 발송에 문제가 발생했습니다.\n"+json.error)
                    }
                }
            },error:function(err){
                console.log(err)
            }})
            
        }else{
            $(".phone-warning").show()
        }
    },error:function(err){
        console.log(err)
    }})
}

function passwordDoAuth(){
    let user_code = $("#user_auth").val();
    if(authCode !== user_code){
        $(".auth-warning").show()
    }else{
        let user_phone = $("#user_phone").val()
        location.href = '/password/reset?user_phone='+user_phone;
    }
}

function resetPw(){

    $(".pw-warning").hide()
    $(".pw-warning2").hide()
    let user_password = $("#user_password").val();
    let user_password2 = $("#user_password2").val();
    let user_phone = $("#user_phone").val();

    if(!chkPwd(user_password)){
        $(".pw-warning").show()
        return false;
    }

    if(user_password !== user_password2){
        $(".pw-warning2").show()
        return false;
    }

    let HOST = $("#HOST").val()
    $.ajax({url:HOST+"api/password/reset", method:"post", data:{user_phone,user_password},success:function(json){
        if(json.success == 200){
            location.href = '/password/complete'
        }else{
            alert(json.message)
        }
    },error:function(err){
        console.log(err)
    }})


}