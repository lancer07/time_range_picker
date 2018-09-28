/**
 *
 * @summary 时间段选择控件
 * @author linqing <linqing-jk@360jinrong.net>
 *
 */

+(function () {

    /**8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--**/

    // 扩展一些数组的方法和工具

    if (!Array.prototype.forEach) {  
        Array.prototype.forEach = function(callback, thisArg) {  
            var T, k;  
            if (this == null) {  
                throw new TypeError(" this is null or not defined");  
            }  
            var O = Object(this);  
            var len = O.length >>> 0; // Hack to convert O.length to a UInt32  
            if ({}.toString.call(callback) != "[object Function]") {  
                throw new TypeError(callback + " is not a function");  
            }  
            if (thisArg) {  
                T = thisArg;  
            }  
            k = 0;  
            while (k < len) {  
                var kValue;  
                if (k in O) {  
                    kValue = O[k];  
                    callback.call(T, kValue, k, O);  
                }  
                k++;  
            }  
        };  
    }  

    // 去重
    Array.prototype.distinct = function () {
        var arr = this,
            i, obj = {},
            result = [],
            len = arr.length;
        for (i = 0; i < arr.length; i++) {
            if (!obj[arr[i]]) {
                obj[arr[i]] = 1;
                result.push(arr[i]);
            }
        }
        return result.sort();
    }

    // 删除某个值
    Array.prototype.remove = function (match) {
        var arr = this,
            len = arr.length;	
        while (len--) {
            if (len in arr && arr[len] === match) {
                arr.splice(len, 1);
            }
        }
        return arr;
    }

    // 处理数组中的连续数字，返回新的二维数组
    Array.prototype.arrange = function() {
        var t;
        var ta;
        var r = [];
        this.forEach(function(v) {
            if (t === v) {
                ta.push(t);
                t++;
                return;
            }
    
            ta = [v];
            t = v + 1;
            r.push(ta);
        });
        return r;
    }

    // 从小到大排序
    function desc(a,b){
        return a - b
    }

    // 判断2个div是否有交集
    function isOverlap(objOne, objTwo) {
        var offsetOne = $(objOne).offset();
        var offsetTwo = $(objTwo).offset();
        var x1 = offsetOne.left;
        var y1 = offsetOne.top;
        var x2 = x1 + $(objOne).width();
        var y2 = y1 + $(objOne).height();

        var x3 = offsetTwo.left;
        var y3 = offsetTwo.top;
        var x4 = x3 + $(objTwo).width();
        var y4 = y3 + $(objTwo).height();

        var zx = Math.abs(x1 + x2 - x3 - x4);
        var x = Math.abs(x1 - x2) + Math.abs(x3 - x4);
        var zy = Math.abs(y1 + y2 - y3 - y4);
        var y = Math.abs(y1 - y2) + Math.abs(y3 - y4);
        return (zx <= x && zy <= y);
    }

    /**8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--**/

    function TimeRangePicker(el) {
        this.el = el; // 选择器 父容器
        this.oneWeek = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
        this.allHalfTime = [];
        for(var i=0;i<24;i++){
            this.allHalfTime.push((i<10? '0' + i : i) + ':00');
            this.allHalfTime.push((i<10? '0' + i : i) + ':30');
        }
        this.allHalfTime.push('24:00');
        this.initTimeSet();
    }

    TimeRangePicker.prototype.initTimeSet = function(){
        // 存放时间点的容器
        this.timeSet = {
            day1 : [],
            day2 : [],
            day3 : [],
            day4 : [],
            day5 : [],
            day6 : [],
            day7 : []
        }
        this.time4Show = {}; // 用于展示
    }

    // 初始化
    TimeRangePicker.prototype.init = function () {
        this.renderDay(); // 渲染时间单元格
        this.bindEvent(); // 绑定事件
    }

    TimeRangePicker.prototype.bindEvent = function(){
        $(this.el).on('click', 'td[data-time]', this.selectBox.bind(this));
        $(this.el).on('mousedown', this.mouseBox.bind(this));
        $(this.el).on('mouseup',this.mouseBoxEnd.bind(this));
        $(this.el).on('click', '.calendar-reset', this.reset.bind(this));
        $(this.el).on('click', '.calendar-get', this.get.bind(this));
    }

    // 渲染周一到周日的时间段
    TimeRangePicker.prototype.renderDay = function () {
        var days = [];
        var oneWeek = this.oneWeek;

        for (var i = 1; i < oneWeek.length + 1; i++) { // 一周7天
            var time48 = [];
            for (var halftime = 0; halftime < 48; halftime++) { // 一天48个半小时
                var times = '<td data-time="' +
                    i + '-' + halftime +
                    '"></td>'
                time48.push(times);
            }
            var day = '<tr>' +
                '<td>' + oneWeek[i - 1] + '</td>' +
                time48 +
                '</tr>';
            days.push(day)
        }
        $(this.el).find(".calendar-body").empty().html(days.join(''));
    }

    // 选中单元格
    TimeRangePicker.prototype.selectBox = function(evt) {
        // 判断是否已选择
        var day = $(evt.target).attr('data-time').split('-')[0];
        var time = $(evt.target).attr('data-time').split('-')[1];
        if($(evt.target).hasClass('selected')){
            $(evt.target).removeClass('selected');
            this.timeSet['day' + day].remove(parseInt(time));
        }else{
            this.timeSet['day' + day].push(parseInt(time));
            this.timeSet['day' + day] = this.timeSet['day' + day].sort(desc);
            $(evt.target).addClass('selected');
        }
        this.integration()
    }

    // 清空选择
    TimeRangePicker.prototype.reset = function() {
        this.initTimeSet();
        $(this.el).find("td[data-time]").removeClass('selected');
        $(this.el).find('.calendar-result').html('')
    }

    // 获取选中单元格
    TimeRangePicker.prototype.get = function() {
        console.log(this.timeSet)
        return this.timeSet;
    }

    // 把时间单元格整合成时间段
    TimeRangePicker.prototype.integration = function() {
        var strHTML = []; // HTML字符串
        var days = this.timeSet;

        // 遍历未合并成二维数组的timeSet
        for(var j in days){
            // 连续的单元格合并成时间段
            this.time4Show[j] = days[j].arrange();
        }
        for(var day in this.time4Show){ 
            // day 是 周一的 所有时间段
            if(this.time4Show[day].length){
                var daysRange = [];
                for(var k=0;k<this.time4Show[day].length;k++){
                    var start = this.allHalfTime[this.time4Show[day][k][0]];
                    var end = '';
                    if(this.time4Show[day][k].length > 1){
                        end = this.allHalfTime[this.time4Show[day][k].pop() + 1];
                        daysRange.push('<span>' + start + '~'+ end + '</span>')
                    }else{
                        end = this.allHalfTime[this.time4Show[day][k][0] + 1];
                        daysRange.push('<span>' + start  + '~'+ end + '</span>')
                    }
                }
                strHTML.push('<li>'+ this.oneWeek[day.slice(-1)-1] +' : '+ daysRange.join(',') +'</li>')
            }
        }
        $(this.el).find('.calendar-result').html(strHTML.join(''))
    }

    // 鼠标拖拽选择
    TimeRangePicker.prototype.mouseBox = function() {
        ev = window.event || ev;
        var oBox = $(this.el)[0];
        //1.获取按下的点
        var x1 = ev.clientX - oBox.offsetLeft;
        var y1 = ev.clientY - oBox.offsetTop;
        var oDiv = $(this.el).find('.calendar-moveSelected')[0];
        oBox.onmousemove = function (ev) {
            ev = window.event || ev;
            var x2 = ev.clientX - oBox.offsetLeft;
            var y2 = ev.clientY - oBox.offsetTop;
            //3.设置div的样式
            oDiv.style.left = (x2 > x1 ? x1 : x2) +"px"; 
            oDiv.style.top = (y2 > y1 ? y1 : y2) +"px";
            oDiv.style.width = Math.abs(x2-x1)+"px";
            oDiv.style.height =Math.abs(y2-y1)+"px";
        }
        return false;
    }

    // 根据框选结果触发选中事件
    TimeRangePicker.prototype.triggerSelect = function() {
        var box = $(this.el).find('.calendar-moveSelected');
        $(this.el).find('td[data-time]').each(function(){
            if(isOverlap(box,this)){
                $(this).trigger('click');
            }
        });
        box.css({'left':0,'top':0,'width':0,'height':0})
    }

    TimeRangePicker.prototype.mouseBoxEnd = function() {
        var oBox = $(this.el)[0];
        oBox.onmousemove = null;
        this.triggerSelect()
    }

    /**8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--**/
    // 实例化
    var timeRangePicker = new TimeRangePicker("#calendar")
    timeRangePicker.init();
    /**8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--8--**/

})();