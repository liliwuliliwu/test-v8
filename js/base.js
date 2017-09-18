/**
 * Created by issuser on 2017/5/5.
 */

//快速点击
//FastClick.attach(document.body);
//阻止冒泡
function stopPropagation(e) {
    e = window.event || e;
    if (document.all) {  //只有ie识别
        e.cancelBubble = true;
    } else {
        e.stopPropagation();
    }
};
//匹配地址栏
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
};


var last = 0;
//灯的闪烁和时间递减
function lightTime(timeSec, obj) {
    function showtime() {
        var h = Math.floor(timeSec / 60 / 60);
        var m = Math.floor((timeSec - h * 60 * 60) / 60);
        var s = Math.floor((timeSec - h * 60 * 60 - m * 60));
        h = h < 10 ? "0" + h : h;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        //console.log(1);
        if (h == "00") {
            obj.text(m + ":" + s);
            if (timeSec <= last) {
                addRemove("status2011");
            }
        } else {
            obj.text(h + ":" + m + ":" + s);
            if (timeSec <= last) {
                addRemove("status2011");
            }
        }
        timeSec--;

        if (timeSec < 0) {
            clearTimeout(timer);
            //小于0的时候需要切换指示灯
            //从准备认购到开启认购时切换,绿灯闪烁
            console.log(obj.parent().parent(".tip").hasClass("tip02"));
            if (obj.parent().parent(".tip").hasClass("tip02")) {
                console.log(2);
                $(".light .tip").css({ "display": "none" }).eq(2).css({ "display": "block" });
                $(".light .color_g span").addClass("cur").parent().siblings().children("span").removeClass("cur");
            }
        }
    }
    showtime();
    var timer = setInterval(function () {
        showtime();
    }, 1000);
};

//发送请求（头部信息获取的请求）
function top_ajax() {
    var activeguid = localStorage.getItem("activeguid");
    if ($("#scroll_div").length == 1) {
        console.log("111");
        $.ajax({
            //url: Core.ApiUrl + "/api/pilotlamp/getCstBuyRoomMessage",
            type: "POST",
            data: JSON.stringify({ activeguid: activeguid }),
            dataType: "json",
            success: function (data) {
                console.log(1);
                data.time = 10;
                //data.result.status = 1;
                //data.result.userstatus = 1;
                if (data.status == 10000) {
                    if (data.result.sales != null) {

                        //1为开启未开盘,2为开盘
                        if (data.result.status == 2) {
                            if (data.result.sales.cstname != null) {
                                //2开盘后的状态,文字和灯
                                var weihao = data.result.sales.phone.substring(data.result.sales.phone.length - 4, data.result.sales.phone.length);
                                $("#scroll_div").html('<marquee id="affiche" align="left" behavior="scroll"  direction="left" height="100%" width="100%" loop="-1" scrollamount="5" >'
                                    + '</marquee>');
                                $("marquee").html(data.result.sales.cstname + "，手机尾号为" + data.result.sales.phone + "，成功选购【" + data.result.sales.ProjectName + " 【" + data.result.sales.bldName + "#" + " " + data.result.sales.RoomName + "】" + "】 " + data.result.sales.CreatTime);
                            }
                            else {

                                $("#scroll_div").html('<marquee id="affiche" align="left" behavior="scroll"  direction="left" height="100%" width="100%" loop="-1" scrollamount="5" >'
                                    + '</marquee>');
                                $("marquee").html("欢迎参加“" + data.result.sales.activityname + "”开盘活动！当前活动状态为：等候认购。");
                            }

                        } else if (data.result.status == 1) {
                            //1开启未开盘后的时候，文字和灯
                            //欢迎参加XXX项目开盘活动！当前活动状态为：等待开盘。
                            console.log("滚动11")
                            $("#scroll_div").html('<marquee id="affiche" align="left" behavior="scroll"  direction="left" height="100%" width="100%" loop="-1" scrollamount="5" >'
                                + '</marquee>');
                            $("marquee").html("欢迎参加“" + data.result.sales.activityname + "”开盘活动！当前活动状态为：等候开盘。");
                        }
                    }
                    //头部信息的滚动
                    //     ScrollImgLeft();
                } else {
                    ajax_state(data);
                }
            },
            error: function (e) {
                //window.location.href="404.html";

            }
        })
    }
};
//top_ajax();
/*
头部灯对应文字
*/
var lightMessage =
    {
        "1000": "等候开盘",
        "2000": "等候认购",
        "2001": "准备认购",
        "2100": "开启认购",
        "21-10": "开启认购",
        "2-110": "认购待审",
        "2-1101": "失效预警",
        "2-1-10": "认购失效",
        "2-120": "认购完成",
        "3": "选房结束",
    };
//灯的信息获取；
function top_light() {
    if ($(".light").length < 1) {
        return false;
    }
    var activeguid = localStorage.getItem("activeguid");
    $.ajax({
        //url: Core.ApiUrl + "/api/pilotlamp/getpilotlampstatus",
        type: "POST",
        data: JSON.stringify({ activeguid: activeguid }),
        dataType: "json",
        success: function (data) {
            //获取到请求的时间，活动状态，客户当前的状态
            //假数据
            //data.time = 10;
            //data.result.status = 1;
            //data.result.userstatus = 1;
            if (data.status == 10000) {
                if (addRemove && typeof (addRemove) == "function") {
                    var info = data.result;
                    if (info != null) {

                        if (info.Status == 2) {

                            if (info.RGLastTime > 0 && info.isKP == -1 && info.isRG == 1 && info.lastgroup == 0)//已购买，同时在有效期
                            {
                                addRemove("status" + info.Status + info.isKP + info.isRG + info.lastgroup);
                                //显示区域
                                var tempMessage = "";
                                if (info.Status == 3)
                                {
                                    tempMessage = lightMessage[3];
                                }
                                else {
                                    if (lightMessage[info.Status + "" + info.isKP + "" + info.isRG + "" + info.lastgroup]) {
                                        tempMessage = lightMessage[info.Status + "" + info.isKP + "" + info.isRG + "" + info.lastgroup];
                                    }
                                }
                                last = info.LevelOneRemind;
                                $(".light .tip").css({ "display": "none" }).eq(3).css({ "display": "block" });
                                $(".light .tip").eq(3).find(".state").text(tempMessage);
                                console.log(tempMessage + "255");
                                lightTime1(info.RGLastTime, $(".light .tip").eq(3).find("span strong"), function () {
                                    $.ajax({
                                        url: Core.ApiUrl + "/api/CancelOrder/CancelOrderByCst",
                                        type: "POST",
                                        data: JSON.stringify({ activityid: activeguid }),
                                        dataType: "json",
                                        success: function (data) {
                                            //alert(JSON.stringify(data));
                                            location.reload();
                                        }
                                    });
                                    //location.reload();
                                });
                                //if (info.RGLastTime > info.LevelOneRemind)
                                //{
                                //}
                                //else if (info.RGLastTime <= info.LevelOneRemind) {
                                //}
                            }
                            else {
                                clearTimeout(timer);
                                $(".light .tip").eq(3).find("span strong").text("");

                                var tempMessage = "";
                                if (info.Status == 3) {
                                    tempMessage = lightMessage[3];
                                }
                                else {
                                    if (lightMessage[info.Status + "" + info.isKP + "" + info.isRG + "" + info.lastgroup]) {
                                        tempMessage = lightMessage[info.Status + "" + info.isKP + "" + info.isRG + "" + info.lastgroup];
                                    }
                                }
                                $(".light .tip").css({ "display": "none" }).eq(3).css({ "display": "block" });
                                console.log(tempMessage + "272");
                                $(".light .tip").eq(3).find(".state").text(tempMessage);
                                addRemove("status" + info.Status + info.isKP + info.isRG + info.lastgroup);
                            }
                        }
                        else {
                            clearTimeout(timer);
                            $(".light .tip").eq(3).find("span strong").text("");

                            var tempMessage = "";
                            if (info.Status == 3) {
                                tempMessage = lightMessage[3];
                            }
                            else {
                                if (lightMessage[info.Status + "" + info.isKP + "" + info.isRG + "" + info.lastgroup])
                                {
                                    tempMessage = lightMessage[info.Status + "" + info.isKP + "" + info.isRG + "" + info.lastgroup];
                                }
                            }
                            console.log(tempMessage + "285");
                            $(".light .tip").css({ "display": "none" }).eq(3).css({ "display": "block" });
                            $(".light .tip").eq(3).find(".state").text(tempMessage);
                        }
                    }
                }
                ////1为开启未开盘,2为开盘
                //if (data.result.status == 1) {
                //    //light_tip["light08"](data);
                //    //light02测试准备认购和倒计时，黄灯闪烁
                //    light_tip["light02"](data);
                //} else if (data.result.status == 2) {
                //    //1为开启未开盘,2为开盘
                //    light_tip["light08"](data);
                //}
            } else {
                ajax_state(data);
            }
        },
        error: function (e) {
            //window.location.href="404.html";
        }
    })

};
var last = 0;
//灯的闪烁和时间递减
function lightTime1(timeSec, obj, callback) {
    function showtime() {
        var h = Math.floor(timeSec / 60 / 60);
        var m = Math.floor((timeSec - h * 60 * 60) / 60);
        var s = Math.floor((timeSec - h * 60 * 60 - m * 60));
        h = h < 10 ? "0" + h : h;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        //console.log(1);
        if (h == "00") {
            obj.text(m + ":" + s);
            if (timeSec <= last) {
                $(".light .tip").eq(3).find(".state").html(lightMessage["2-1101"]);
                addRemove("status2-1101");
            }
        } else {
            obj.text(h + ":" + m + ":" + s);
            if (timeSec <= last) {
                $(".light .tip").eq(3).find(".state").html(lightMessage["2-1101"]);
                addRemove("status2-1101");

            }
        }


        if (timeSec <= 0) {
            clearTimeout(timer);
            //小于0的时候需要切换指示灯
            //从准备认购到开启认购时切换,绿灯闪烁
            console.log(obj.parent().parent(".tip").hasClass("tip02"));
            if (obj.parent().parent(".tip").hasClass("tip02")) {
                console.log(2);
                $(".light .tip").css({ "display": "none" }).eq(3).css({ "display": "block" });
                //$(".light .color_g span").addClass("cur").parent().siblings().children("span").removeClass("cur");
            }
            callback();
            return false;
        }
        timeSec--;
    }
    showtime();
    timer = setInterval(function () {
        showtime();
    }, 1000);
};
var timer;
top_light();
////头部请求-end


//统一处理状态码和弹出遮罩
function ajax_state(data, fn) {
    var msg = "";
    switch (data.status) {
        case 10007:
            msg = data.result;
            break;
        case 10009:
            msg = "您的证件号码已被其他微信绑定！";
            break;
        case 10011:
            msg = "您还没有排卡，请重新输入身份证号！";
            break;
        case 10013:
            msg = "登录失败，请刷新重试！"
            break;
        case 10015:
            msg = "对不起，手慢一步。去看看其他房间。"
            break;
    }
    maskalert(msg, fn);

};
//弹框为返回的
function maskalert(cont, fn) {
    $("body").append("<div id='maskident'><div class='mask_white'><h3></h3><div class='bottom_btn'><span>确定</span></div></div></div>");
    $("#maskident").show().find("h3").html(cont);
    $("#maskident span").click(function () {
        $("#maskident").remove();
        if (fn) {
            fn();
        }
    })
    //阻止滚动冒泡
    $("#maskident").bind("touchmove", function (e) {
        e.preventDefault();
    })

};

//弹框，点击立即购买后的的弹框和购物车按钮点击后弹框，阻止滚动
if ($(".orderPop").length > 0) {
    $(".orderPop").bind("touchmove", function (e) {
        e.preventDefault();
    })
}

if($(".event_pop").length>0){
    //$(".event_pop").bind("touchmove", function (e) {
    //    e.preventDefault();
    //})
}




//处理弹框有确定和取消的
function cancelConfirm_Mask(cont) {
    $("body").append("<div id='maskident'  ><div class='mask_white'><h3></h3><div class='bottom_btn'><span class='quit' >取消</span><span class='confirm'>确定</span></div></div></div>");
    $("#maskident").show().find("h3").html(cont);
    $("#maskident .quit").click(function () {
        $("#maskident").remove();
    })
    //阻止mask弹出后滚动冒泡
    $("#maskident").bind("touchmove", function (e) {
        e.preventDefault();
    })

};
///loading状态的封装
function loading(obj) {
    console.log("loading");
    //var _html=obj||$("body");
    if (obj == null) {
        $("body").append("<div class='loading'>"
            + "<div class='spinner'>"
            + "<div class='bounce1'></div>"
            + "<div class='bounce2'></div>"
            + "<div class='bounce3'></div>"
            + "</div>"
            + "</div>");
    } else {
        obj.html("<div class='loading'>"
            + "<div class='spinner'>"
            + "<div class='bounce1'></div>"
            + "<div class='bounce2'></div>"
            + "<div class='bounce3'></div>"
            + "</div>"
            + "</div>");
    }
    //console.log(obj.html());
};

//房间详情页面的时候，加入立即购买通过，//未售出且绿灯在闪烁的时候，我们的立即购买按钮可以点击，否则立即购买按钮为灰色且不可以点击
function changebtn() {
    //未售出
    if ($(".light .color_g span").hasClass("cur")) {
        //未售出且绿灯在闪烁的时候，立即购买按钮可以点击，否则立即购买按钮为灰色且不可以点击
        $(".buttones .btnes .confirm").css({ "background-color": "#48C9F1" });
        $(".confirm").click(function () {
            var str = location.search.splice(1);
            window.location.href = "cart_detail.html";
        })
    } else {
        $(".buttones .btnes .confirm").css({ "background-color": "#DDD" });
    }
    $(".buttones .btnes .clear").click(function () {
        $(".mask").show();
        $(".mask .btn_confirm").click(function () {
            $(".mask").hide();
        })
    })
};

//闪灯拖拽
function lightDrag() {
    var oDiv = document.getElementsByClassName('light')[0];
    var disX, moveX, L, T, starX, starY, starXEnd, starYEnd;
    if (document.getElementsByClassName('light').length < 1) {
        return;
    }
    oDiv.addEventListener('touchstart', function (e) {
        e.preventDefault();//阻止触摸时页面的滚动，缩放
        disX = e.touches[0].clientX - this.offsetLeft;
        disY = e.touches[0].clientY - this.offsetTop;
        //手指按下时的坐标
        starX = e.touches[0].clientX;
        starY = e.touches[0].clientY;
        //console.log(disX);
        $(".tipwap").slideToggle(200);
    });

    oDiv.addEventListener('touchmove', function (e) {
        $(".tipwap").css("display", "block");
        L = e.touches[0].clientX - disX;
        T = e.touches[0].clientY - disY;
        //移动时 当前位置与起始位置之间的差值
        starXEnd = e.touches[0].clientX - starX;
        starYEnd = e.touches[0].clientY - starY;
        //console.log(L);
        if (L < 0) {//限制拖拽的X范围，不能拖出屏幕
            L = 0;
        } else if (L > document.documentElement.clientWidth - this.offsetWidth) {
            L = document.documentElement.clientWidth - this.offsetWidth;
        }
        if (T < 0) {//限制拖拽的Y范围，不能拖出屏幕
            T = 0;
        } else if (T > document.documentElement.clientHeight - this.offsetHeight) {
            T = document.documentElement.clientHeight - this.offsetHeight;
        }
        moveX = L + 'px';
        moveY = T + 'px';
        //console.log(moveX);
        this.style.left = moveX;
        this.style.top = moveY;
    });
    window.addEventListener('touchend', function (e) {
        //alert(parseInt(moveX))
        //判断滑动方向
    });
};
lightDrag();

var addactin = function (act, fn) {
    console.log(act);
    loading();
    $.ajax({
        url: Core.ApiUrl + "/api/activity/AddActivitiesIn",
        type: "POST",
        //url: "../data.json",
        //type: "GET",
        contentType: 'application/json',
        data: JSON.stringify({ activityid: act }),
        dataType: 'json',
        async: true,
        success: function (data) {
            $(".loading").remove();
            if (data.status = 10000) {
                fn();
            } else {
                return false;
            }
        },
        error: function (ex) {
            $(".loading").remove();
            return false;
        }
    })
};