/* Custom Pulldown */

var customPulldown = {
	init:function(){
		var x, i, j, selElmnt, a, b, c;
		/*look for any elements with the class "custom-select":*/
		x = document.getElementsByClassName("custom-select");
		for (i = 0; i < x.length; i++) {
			selElmnt = x[i].getElementsByTagName("select")[0];
			selElmnt.setAttribute("class", "inited");
			/*for each element, create a new DIV that will act as the selected item:*/
			a = document.createElement("DIV");
			a.setAttribute("class", "select-selected");
			a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
			x[i].appendChild(a);
			/*for each element, create a new DIV that will contain the option list:*/
			b = document.createElement("DIV");
			b.setAttribute("class", "select-items select-hide");
			for (j = 1; j < selElmnt.length; j++) {
				/*for each option in the original select element,
				create a new DIV that will act as an option item:*/
				c = document.createElement("DIV");
				c.innerHTML = selElmnt.options[j].innerHTML;
				if(selElmnt.options[j].disabled)
				{
					c.setAttribute("class", "select-disabled");
					c.addEventListener("click", function(e) {
						return false;
					});
				}
				else
				{
					c.addEventListener("click", function(e) {
						/*when an item is clicked, update the original select box,
						and the selected item:*/
						var y, i, k, s, h;
						s = this.parentNode.parentNode.getElementsByTagName("select")[0];
						h = this.parentNode.previousSibling;
						for (i = 0; i < s.length; i++) {
							if (s.options[i].innerHTML == this.innerHTML) {
								s.selectedIndex = i;
								h.innerHTML = this.innerHTML;
								y = this.parentNode.getElementsByClassName("same-as-selected");
								for (k = 0; k < y.length; k++) {
									y[k].removeAttribute("class");
								}
								this.setAttribute("class", "same-as-selected");
								break;
							}
						}
						h.click();
					});
				}
				b.appendChild(c);
			}
			x[i].appendChild(b);
			a.addEventListener("click", function(e) {
				/*when the select box is clicked, close any other select boxes,
				and open/close the current select box:*/
				e.stopPropagation();
				closeAllSelect(this);
				this.nextSibling.classList.toggle("select-hide");
				this.classList.toggle("select-arrow-active");
			});
		}
	},
	destroy:function(){
		$(".custom-select").each(function(index, element) {
            $(this).find(".select-selected").remove();
			$(this).find(".select-items").remove();
			$(this).find("select").removeClass("inited");
        });
	}
};

function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
	disableClass = false;
	try{
		if(elmnt.target.className == "select-disabled") disableClass = true;
	}catch(e){}
	if(!disableClass)
	{
		var x, y, i, arrNo = [];
		x = document.getElementsByClassName("select-items");
		y = document.getElementsByClassName("select-selected");
		for (i = 0; i < y.length; i++) {
			if (elmnt == y[i]) {
				arrNo.push(i)
			} else {
				y[i].classList.remove("select-arrow-active");
			}
		}
		for (i = 0; i < x.length; i++) {
			if (arrNo.indexOf(i)) {
				x[i].classList.add("select-hide");
			}
		}
	}
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);

/****************************************************************/

var setDisable = {
	mediatype:function(){
		$("#mediatype option").attr("disabled", false);
		if($("#enquirytype").val()=="General Enquiry")
			$("#mediatype option[value='Analyst'], #mediatype option[value='Institutional Investor'], #mediatype option[value='Individual Investor'], #mediatype option[value='Individual Shareholder']").attr("disabled", true);
		if($("#enquirytype").val()=="Business Enquiry")
			$("#mediatype option[value='Analyst'], #mediatype option[value='Individual Investor'], #mediatype option[value='Individual Shareholder']").attr("disabled", true);
	},
	enquirytype:function(){
		$("#enquirytype option").attr("disabled", false);
		if($("#mediatype").val()=="Analyst" || $("#mediatype").val()=="Institutional Investor" || $("#mediatype").val()=="Individual Investor" || $("#mediatype").val()=="Individual Shareholder")
			$("#enquirytype option[value='General Enquiry']").attr("disabled", true);
		if($("#mediatype").val()=="Analyst" || $("#mediatype").val()=="Individual Investor" || $("#mediatype").val()=="Individual Shareholder")
			$("#enquirytype option[value='Business Enquiry']").attr("disabled", true);
	}
}

/****************************************************************/

$(function(){
  function __(label){
    const lang = {
      'en-us': { '提交': 'Submit', '正在提交': 'Submitting' },
    };
    if(typeof lang[_locale] !== "undefined" && typeof lang[_locale][label] !== "undefined"){
      return lang[_locale][label]
    } else {
      return label
    }
  }

	$("#vcodeRefresh").bind({
		"click":function(){
      $.get('/captcha/api', function(data) {
        $('#vcodeKey').val(data.key);
        $('#vcodeImg').attr('src', data.img)
      }, 'json');
		}
	});

	$(".textAreaBox textarea").bind({
		"keyup":function(){
			remain = $(this).val().length;
			$(this).siblings(".countNote").text(remain+"/700");
		}
	});

	$(".mediatypeArea").bind({
		"click":function(){
			customPulldown.destroy();
			setDisable.enquirytype();
			customPulldown.init();
			$(this).removeClass("inputError");
			$(".enquiryHide").removeClass("enquiryHide");
		}
	});

	$(".enquirytypeArea").bind({
		"click":function(){
			customPulldown.destroy();
			setDisable.mediatype();
			customPulldown.init();
			$(this).removeClass("inputError");
		}
	});

	$(".enquiryForm .inputField input, .enquiryForm .inputField textarea").bind({
		"focus":function(){
			$(this).parent(".inputField").removeClass("inputError");
		}
	});

	setDisable.enquirytype();
	setDisable.mediatype();
	customPulldown.init();

  $("#vcodeRefresh").click();

	$('#submit').on('click', function() {
	  if($(this).val() === __('正在提交')){
	    return
    }

    let form = $('form');
	  $('.errorNote').remove();
	  $(this).val(__('正在提交')).attr("disabled",true);

	  $.ajax({
      type: 'POST',
      dataType: 'json',
      url: form.attr('action'),
      data: form.serialize(),
      success: function(data) {
        $('input[type=reset]').click();
        alert(data.message)
        // $('div.alert.alert-success').remove();
        // $('.enquiryForm').prepend(`<div class="alert alert-success">${data.message}</div>`)
      },
      error: function(data) {
        let errors = JSON.parse(data.responseText);
        if(typeof errors.message === "undefined"){
          for(let name in errors){
            console.log($(`form [name=${name}]`))
            let dom = $(`form [name=${name}]`).parent();
            dom.addClass('inputError')
            // 验证码的错误信息位置比较特殊
            if(name === 'vcode'){
              $('.vcodeImgArea').prepend(`<div class="errorNote">${errors[name][0]}</div>`)
            } else{
              dom.prepend(`<div class="errorNote">${errors[name][0]}</div>`)
            }
          }
        } else {
          alert(errors.message)
        }
      },
      complete: function() {
        $("#vcodeRefresh").click();
        $('#submit').val(__('提交')).attr("disabled",false);
      }
    });
  })
});
