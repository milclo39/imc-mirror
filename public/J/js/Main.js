var USE_LOCAL = false;

var MODE = {
    CAMERA : "Camera",
    WHITEBOARD1 : "Whiteboard1",
    WHITEBOARD2 : "Whiteboard2",
    WHITEBOARD3 : "Whiteboard3",
    WHITEBOARD4 : "Whiteboard4",
    TRANSPARENT : "Transparent",
    CONTENTS : "Contents",
    IMAGE : "image",
    VIDEO : "video",
    URL : "url",
    DRIVE : "drive",
    MATERIAL : "material",
};

var cvs = $("#canvas").get(0);
var ctx = cvs.getContext("2d");

var timeout_status = 2000;
var opacity_pen = 1.0;
var opacity_marker = 0.5;
var width_pen = 1;
var width_marker = 3;
var color_pen = "rgba(0,0,0,1.0)";
var color_marker = "rgba(255,255,0,1.0)";
var color_text = "rgb(0,0,0)";
var color_text_background = "rgb(239,228,179)";
var font_size_text = 30;
var font_family_text = "Arial";
var font_weight_text = "";
var imgInsertPath = null;
var background_type = "whiteboard1";
var id_timeout_setitemtype = null;
var imgLiveTmp = null;
var deviceid = null, r = 0;
var camera_w = 1280, camera_h = 720;
var is_mute = true;
var imgDefaultTmp1 = null;
var imgDefaultTmp2 = null;
var imgDefaultTmp3 = null;
var imgDefaultTmp4 = null;
var selectContents = document.createElement('input');
selectContents.type = 'file';
selectContents.id = 'selectfile';
selectContents.name = 'selectfile';
selectContents.style = 'display:none';
selectContents.accept = '.png, .jpg, .jpeg, .bmp, .webm, .mp4';

var imgBackgroundTmp = null;
var videoBackgroundTmp = null;
var urlBackgroundTmp = null;
var materialBackgroundTmp = null;
var is_recording = false;

var imgDataTmpCamera = null;
var imgDataTmpWhiteboard1 = null;
var imgDataTmpWhiteboard2 = null;
var imgDataTmpWhiteboard3 = null;
var imgDataTmpWhiteboard4 = null;
var imgDataTmpTransparent = null;
var imgDataTmpImage = null;
var imgDataTmpVideo = null;
var imgDataTmpMaterial = null;

var selectInsertImage = document.createElement('input');
selectInsertImage.type = 'file';
selectInsertImage.id = 'selectfileinsert';
selectInsertImage.name = 'selectfileinsert';
selectInsertImage.style = 'display:none';
selectInsertImage.accept = '.png, .jpg, .jpeg, .bmp';

$("#background").css('background-color', 'transparent');
document.getElementById('video').style.display = "none";
document.getElementById('image').style.display = "none";
/*
 * The former bootstrap-select 1.12.4 control depended on Bootstrap 3's
 * jQuery dropdown API. Keep the native select as the application's source
 * of truth and render its image-capable menu here instead.
 */
(function ($) {
    function ModePicker(select) {
        this.select = select;
        this.$select = $(select);
        this.id = select.id + '-picker';
        this.create();
        this.refresh();
        this.$select.on('change.modePicker', this.refresh.bind(this));
    }

    ModePicker.prototype.create = function () {
        var self = this;
        this.$select.addClass('mode-picker-source');
        this.$root = $('<div>', { class: 'mode-picker', id: this.id });
        this.$toggle = $('<button>', {
            type: 'button',
            class: 'mode-picker-toggle',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-controls': this.id + '-menu'
        });
        this.$value = $('<span>', { class: 'mode-picker-value' });
        this.$toggle.append(this.$value, $('<span>', { class: 'mode-picker-caret', 'aria-hidden': 'true' }));
        this.$menu = $('<ul>', { class: 'mode-picker-menu', id: this.id + '-menu', role: 'listbox' });
        this.$root.append(this.$toggle, this.$menu);
        this.$select.after(this.$root);

        this.$toggle.on('click', function () {
            self.toggle();
        }).on('keydown', function (event) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                self.open();
                self.focusOption(event.key === 'ArrowDown' ? 1 : -1);
            } else if (event.key === 'Escape') {
                self.close();
            }
        });

        $(document).on('mousedown.' + this.id, function (event) {
            if (!self.$root[0].contains(event.target)) self.close();
        });
    };

    ModePicker.prototype.optionContent = function (option) {
        var content = document.createElement('span');
        content.className = 'mode-picker-option-content';
        if (option.dataset.content) {
            var template = document.createElement('template');
            template.innerHTML = option.dataset.content;
            content.append(template.content.cloneNode(true));
        } else {
            content.textContent = option.textContent;
        }
        return content;
    };

    ModePicker.prototype.refresh = function () {
        var self = this;
        var selected = this.select.options[this.select.selectedIndex];
        this.$value.empty();
        if (selected) this.$value.append(this.optionContent(selected));

        this.$menu.empty();
        Array.prototype.forEach.call(this.select.options, function (option, index) {
            var $item = $('<li>');
            var $button = $('<button>', {
                type: 'button',
                class: 'mode-picker-option',
                role: 'option',
                'aria-selected': option.selected ? 'true' : 'false',
                disabled: option.disabled
            }).append(self.optionContent(option));
            $button.on('click', function () {
                if (self.select.selectedIndex !== index) {
                    self.select.selectedIndex = index;
                    self.select.dispatchEvent(new Event('change', { bubbles: true }));
                }
                self.close();
                self.$toggle.trigger('focus');
            });
            $item.append($button);
            self.$menu.append($item);
        });
    };

    ModePicker.prototype.open = function () {
        if (this.$root.hasClass('is-open') || this.select.disabled) return;
        this.$root.addClass('is-open');
        this.$toggle.attr('aria-expanded', 'true');
        this.$select.trigger('show.modePicker');
    };

    ModePicker.prototype.close = function () {
        if (!this.$root.hasClass('is-open')) return;
        this.$root.removeClass('is-open');
        this.$toggle.attr('aria-expanded', 'false');
    };

    ModePicker.prototype.toggle = function () {
        this.$root.hasClass('is-open') ? this.close() : this.open();
    };

    ModePicker.prototype.focusOption = function (direction) {
        var buttons = this.$menu.find('.mode-picker-option:not(:disabled)');
        if (!buttons.length) return;
        var current = buttons.index(document.activeElement);
        var index = current < 0 ? this.select.selectedIndex : (current + direction + buttons.length) % buttons.length;
        buttons.eq(Math.max(0, index)).trigger('focus');
    };

    $.fn.modePicker = function (method) {
        return this.each(function () {
            var picker = $.data(this, 'modePicker');
            if (!picker) {
                picker = new ModePicker(this);
                $.data(this, 'modePicker', picker);
            }
            if (method === 'refresh') picker.refresh();
        });
    };
}(jQuery));

$('#modeList').modePicker();
$('.selectitem').fadeOut("fast");
$('.recording').fadeOut("fast");
$(".rotation").fadeOut("fast");
$(".freeze").fadeOut("fast");
$(".speaker").fadeOut("fast");
$(".timer").fadeOut("fast");
/*
$(".login").fadeOut("fast");
*/
/* ------------------------------------------------------------------------------------------------ */
var ITEM_TYPE = {
    ZOOM : "zoom",
    SELECT : "select",
    ERASER : "eraser",
    LINE_FREE_PEN : "line_free_pen",
    LINE_FREE_MARKER : "line_free_marker",
    LINE_STRAIGHT : "line_straight",
    RECT_FILL : "rect_fill",
    RECT_EMPTY : "rect_empty",
    RECT_SELECT : "rect_select",
    TEXT : "text",
    IMAGE : "image",
};

var item_type = ITEM_TYPE.LINE_FREE_PEN;

var angle_rotation = 0;
var scale_zoom = 1.0;
var background_width = $("#draw").width();
var background_height = $("#draw").height();
var is_freeze = false;
var moveX = 0, moveY = 0;
var defaultX = 0, defaultY = 0;
var rangeX = 0, rangeY = 0;
var origX = 0, origY = 0;

/* ------------------------------------------------------------------------------------------------ */
var click = false;
var points = [];
var STACK_MAX_SIZE = 5;
var undoDataStack = [];
var redoDataStack = [];

/* ------------------------------------------------------------------------------------------------ */
function start(e) {
    if (click == true) {
        return;
    } else {
        click = true;
    }
    hideSetting();
    if (item_type == ITEM_TYPE.ZOOM) {
        var rect = e.target.getBoundingClientRect();
        if (e.clientX !== undefined) {
            rangeX = e.clientX - rect.left;
            rangeY = e.clientY - rect.top;
        } else {
            rangeX = e.touches[0].clientX - rect.left;
            rangeY = e.touches[0].clientY - rect.top;
        }
        origX = rangeX;
        origY = rangeY;
        if (background_type == "camera" || background_type == "video") {
            defaultX = parseInt($('#video').css('margin-left').replace('px', ''));
            defaultY = parseInt($('#video').css('margin-top').replace('px', ''));
            rangeX = Math.ceil((background_width * scale_zoom - cvs.width) / 2);
            rangeY = Math.ceil((background_height * scale_zoom - cvs.height) / 2);
        } else {
            defaultX = parseInt($('#line').css('margin-left').replace('px', ''));
            defaultY = parseInt($('#line').css('margin-top').replace('px', ''));
            rangeX = Math.ceil((background_width * scale_zoom - cvs.width) / 2);
            rangeY = Math.ceil((background_height * scale_zoom - cvs.height) / 2);
        }
    } else {
        if (e.clientX !== undefined) {
            points.push({ x: e.clientX, y: e.clientY });
        } else {
            points.push({ x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY });
        }
        beforeDraw();
    }
}
function move(e) {
    if (click == false) {
        return;
    }
    if (item_type == ITEM_TYPE.ZOOM) {
        var rect = e.target.getBoundingClientRect();
        if (e.clientX !== undefined) {
            moveX = defaultX + parseInt(-(origX - (e.clientX - rect.left)), 10);
            moveY = defaultY + parseInt(-(origY - (e.clientY - rect.top)), 10);
        } else {
            moveX = defaultX + parseInt(-(origX - (e.changedTouches[0].pageX - rect.left)), 10);
            moveY = defaultY + parseInt(-(origY - (e.changedTouches[0].pageY - rect.top)), 10);
        }
        if (background_type == "camera" || background_type == "video") {
            if (-1 * rangeX <= moveX && rangeX >= moveX) {
                $('#video').css('margin-left', moveX + 'px');
                $('#line').css('margin-left', moveX + 'px');
            }
            if (-1 * rangeY <= moveY && rangeY >= moveY) {
                $('#video').css('margin-top', moveY + 'px');
                $('#line').css('margin-top', moveY + 'px');
            }
        } else {
            if (-1 * rangeX <= moveX && rangeX >= moveX) {
                $('#image').css('margin-left', moveX + 'px');
                $('#line').css('margin-left', moveX + 'px');
            }
            if (-1 * rangeY <= moveY && rangeY >= moveY) {
                $('#image').css('margin-top', moveY + 'px');
                $('#line').css('margin-top', moveY + 'px');
            }
        }
    } else {
        if (item_type == ITEM_TYPE.ERASER || e.which == 3) {
            var background_line = document.getElementById('line');
            var ctxLine = background_line.getContext("2d");
            draw(e, ctxLine, false);
        } else {
            draw(e, ctx, true);
        }
    }
}
function draw(e, ctx, clear) {
    if (item_type == ITEM_TYPE.ERASER || e.which == 3) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 50;
        ctx.globalAlpha = 1.0;
    } else {
        ctx.globalCompositeOperation = "source-over";
        if (item_type == ITEM_TYPE.LINE_FREE_MARKER) {
            ctx.strokeStyle = color_marker;
            ctx.fillStyle = color_marker;
            ctx.lineWidth = width_marker == 1 ? 3 : width_marker == 2 ? 10 : 25;
            ctx.globalAlpha = opacity_marker;
        } else {
            ctx.strokeStyle = color_pen;
            ctx.fillStyle = color_pen;
            ctx.lineWidth = width_pen == 1 ? 3 : width_pen == 2 ? 10 : 25;
            ctx.globalAlpha = opacity_pen;
        }
    }
    ctx.lineJoin = ctx.lineCap = 'round';
    if (e.clientX !== undefined) {
        points.push({ x: e.clientX, y: e.clientY });
    } else {
        points.push({ x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY });
    }
    var p1 = points[0];
    var p2 = points[1];
    if (clear) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    for (var i = 1, len = points.length; i < len; i++) {
        var midPoint = midPointBtw(p1, p2);
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
        p1 = points[i];
        p2 = points[i+1];
    }
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
}
function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}
function finish(e) {
    if (click == false) {
        return;
    } else {
        click = false;
    }
    if (item_type != ITEM_TYPE.ZOOM) {
        var background_line = document.getElementById('line');
        var ctxLine = background_line.getContext("2d");
        draw(e, ctxLine, false);
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    points.length = 0;
}
$("#canvas").on("mousedown", function(e) { start(e); });
$("#canvas").on("mousemove", function(e) { move(e); });
$("#canvas").on("mouseup", function(e) { finish(e); });
$("#canvas").on("mouseleave", function(e) { finish(e); });
addEventListener("touchstart", function(e) {
    if (e.target.id == "canvas") {
        e.preventDefault();
        start(e);
    }
}, {passive: false});
addEventListener("touchmove", function(e) { move(e); });
addEventListener("touchend", function(e) { finish(e); });
document.oncontextmenu = function () {return false;}

/* ------------------------------------------------------------------------------------------------ */
var touchstart_bar = 0;
var touchmove_bar = 0;
addEventListener("touchstart", function(e) {
    touchstart_bar = 0;
    touchmove_bar = 0;
    if (e.touches.length > 1) {
        canvas.isDrawingMode = false;
        w_abs_start = Math.abs(e.touches[1].pageX - e.touches[0].pageX);
        h_abs_start = Math.abs(e.touches[1].pageY - e.touches[0].pageY);
        touchstart_bar = w_abs_start*h_abs_start;
    }
}, false);
addEventListener("touchmove", function(e) {
    if (e.touches.length > 1) {
        w_abs_move = Math.abs(e.touches[1].pageX - e.touches[0].pageX);
        h_abs_move = Math.abs(e.touches[1].pageY - e.touches[0].pageY);
        touchmove_bar = w_abs_move*h_abs_move;
        area_bar = touchstart_bar-touchmove_bar;
        if (area_bar < 0) {
            scale_zoom = parseFloat(scale_zoom) + parseFloat(0.2);
        } else if (area_bar > 0) {
            scale_zoom = parseFloat(scale_zoom) - parseFloat(0.2);
        }
        if (scale_zoom < 1.0) {
            scale_zoom = 1.0;
        } else if (scale_zoom > 8.0) {
            scale_zoom = 8.0;
        }
        $("input[type=range]").val(scale_zoom).change();
    }
}, false);

/* ------------------------------------------------------------------------------------------------ */
function beforeDraw() {
    redoDataStack = [];
    if (undoDataStack.length >= STACK_MAX_SIZE) {
        undoDataStack.pop();
    }
    undoDataStack.unshift(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
}
function undo() {
    if (undoDataStack.length <= 0) return;
    redoDataStack.unshift(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
    var imageData = undoDataStack.shift();
    ctx.putImageData(imageData, 0, 0);
}
function redo() {
    if (redoDataStack.length <= 0) return;
    undoDataStack.unshift(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
    var imageData = redoDataStack.shift();
    ctx.putImageData(imageData, 0, 0);
}

/* ------------------------------------------------------------------------------------------------ */
$('#modeList').append('<option id="wbmode1" value="Whiteboard1" data-content="<img src=\'./' + useLanguage + '/images/WHITEBOARD.png\' style=\'width:46px; height:46px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_WHITEBOARD + ' 1</span>"></option>');
$('#modeList').append('<option id="wbmode2" value="Whiteboard2" data-content="<img src=\'./' + useLanguage + '/images/WHITEBOARD.png\' style=\'width:46px; height:46px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_WHITEBOARD + ' 2</span>"></option>');
$('#modeList').append('<option id="wbmode3" value="Whiteboard3" data-content="<img src=\'./' + useLanguage + '/images/WHITEBOARD.png\' style=\'width:46px; height:46px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_WHITEBOARD + ' 3</span>"></option>');
$('#modeList').append('<option id="wbmode4" value="Whiteboard4" data-content="<img src=\'./' + useLanguage + '/images/WHITEBOARD.png\' style=\'width:46px; height:46px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_WHITEBOARD + ' 4</span>"></option>');
if (USE_LOCAL == true) $('#modeList').append('<option id="transparent" value="Transparent" data-content="<img src=\'./' + useLanguage + '/images/WHITEBOARD.png\' style=\'width:46px; height:46px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_TRANSPARENT + '</span>"></option>');
$('#modeList').append('<option id="contentsmode" value="Contents" data-content="<img src=\'./' + useLanguage + '/images/CONTENTS.png\' style=\'width:46px; height:46px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_CONTENTS + '</span>"></option>');
/*
$('#modeList').append('<option id="url" value="url" data-content="<img src=\'./' + useLanguage + '/images/URL.png\' style=\'width:40px; height:40px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_URL + '</span>"></option>');
*/
$('#modeList').modePicker("refresh");
if (!language.includes("ja") && !language.includes("en")) showCookieConsentMessage();
function showCookieConsentMessage() {
    if (!confirm(TEXT_COOKIE_CONSENT)){
        window.open('about:blank', '_self').close();
    }
}
var useOS, ua = navigator.userAgent;
if (ua.match(/Win(dows )?NT 10\.0/)) {
    useOS = "Windows 10";
} else if (ua.match(/Win(dows )?NT 6\.3/)) {
    useOS = "Windows 8.1";
} else if (ua.match(/Win(dows )?NT 6\.2/)) {
    useOS = "Windows 8";
} else if (ua.match(/Win(dows )?NT 6\.1/)) {
    useOS = "Windows 7";
} else if (ua.match(/Win(dows )?NT 6\.0/)) {
    useOS = "Windows Vista";
} else if (ua.match(/Win(dows )?NT 5\.2/)) {
    useOS = "Windows Server 2003";
} else if (ua.match(/Win(dows )?(NT 5\.1|XP)/)) {
    useOS = "Windows XP";
} else if (ua.match(/Win(dows)? (9x 4\.90|ME)/)) {
    useOS = "Windows ME";
} else if (ua.match(/Win(dows )?(NT 5\.0|2000)/)) {
    useOS = "Windows 2000";
} else if (ua.match(/Win(dows )?98/)) {
    useOS = "Windows 98";
} else if (ua.match(/Win(dows )?NT( 4\.0)?/)) {
    useOS = "Windows NT";
} else if (ua.match(/Win(dows )?95/)) {
    useOS = "Windows 95";
} else if (ua.match(/Windows Phone/)) {
    useOS = "Windows Phone";
} else if (ua.match(/iPhone|iPad/)) {
    useOS = "iOS";
} else if (ua.match(/Mac|PPC/)) {
    useOS = "Mac OS";
} else if (ua.match(/Android ([\.\d]+)/)) {
    useOS = "Android " + RegExp.$1;
} else if (ua.match(/Linux/)) {
    useOS = "Linux";
} else if (ua.match(/^.*\s([A-Za-z]+BSD)/)) {
    os = RegExp.$1;
} else if (ua.match(/SunOS/)) {
    useOS = "Solaris";
} else {
    useOS = "N/A";
}
var userAgent = window.navigator.userAgent.toLowerCase();
var useBrowser = "none";
if (userAgent.indexOf('msie') != -1) {
    alert("IE" + TEXT_BROWSEER_UNSUPPORTED ); window.open('about:blank', '_self').close();
    useBrowser = "ie10";
} else if (userAgent.indexOf('trident') != -1) {
    alert("IE" + TEXT_BROWSEER_UNSUPPORTED); window.open('about:blank', '_self').close();
    useBrowser = "ie11";
} else if (userAgent.indexOf('edge') != -1) {
    useBrowser = "edge";
} else if (userAgent.indexOf('chrome') != -1 || userAgent.indexOf('crios') != -1) {
    useBrowser = "chrome";
} else if (userAgent.indexOf('safari') != -1) {
    var ver = userAgent.slice(userAgent.indexOf("version/") + 8, userAgent.indexOf("version/") +  8 + 2);
    if (ver.indexOf(".") != -1 || parseInt(ver) == 10) {
        alert("WebRTC's support is from Safari version 11.");
        useBrowser = "safari_not_support_webrtc";
    } else {
        useBrowser = "safari";
    }
} else if (userAgent.indexOf('firefox') != -1) {
    alert("Firefox" + TEXT_BROWSEER_UNSUPPORTED); window.open('about:blank', '_self').close();
    useBrowser = "firefox";
} else if (userAgent.indexOf('opera') != -1) {
    alert("Opera" + TEXT_BROWSEER_UNSUPPORTED); window.open('about:blank', '_self').close();
    useBrowser = "opera";
}
if (useBrowser != "chrome") {
    //selectContents.accept = '.png, .jpg, .jpeg, .bmp';
    $(".help").attr('src', './' + useLanguage + '/images/Information.png');
    $("#help").attr('href', './' + useLanguage + '/Manual/Disclaimer.html');
}
$(".menuup").attr('title',TEXT_TOOLTIP_OPEN);
$(".menudown").attr('title',TEXT_TOOLTIP_CLOSE);
$(".pencil").attr('title',TEXT_TOOLTIP_PEN);
$(".marker").attr('title',TEXT_TOOLTIP_MARKER);
$(".clearObject").attr('title',TEXT_TOOLTIP_ERASER);
$(".selectitem").attr('title',TEXT_TOOLTIP_SELECT);
$(".captureall").attr('title',TEXT_TOOLTIP_CAP);
$(".recording").attr('title',TEXT_TOOLTIP_REC);
$(".rotation").attr('title',TEXT_TOOLTIP_ROTATION);
$(".freeze").attr('title',TEXT_TOOLTIP_FREEZE);
$(".zoomrange").attr('title',TEXT_TOOLTIP_ZOOM);
$(".speaker").attr('title',TEXT_TOOLTIP_SPEAKER);
$(".fullscreen").attr('title',TEXT_TOOLTIP_FULLSCREEN);
$(".help").attr('title',TEXT_TOOLTIP_HELP);
$(".positionchange").attr('title',TEXT_TOOLTIP_MENUPOS);
$(".timer").attr('title',TEXT_TOOLTIP_TIMER);
/*
$(".login").attr('title',TEXT_TOOLTIP_LOGIN);
*/
/* ------------------------------------------------------------------------------------------------ */
var scale_window = 1.000;
var id_timeout_resize = null;
var is_show_setting_tmp = false;
function canvas_resize() {
    if (id_timeout_resize != null)  clearTimeout(id_timeout_resize);
    $(".iframe").colorbox.close();
    scale_window = parseFloat(window.innerWidth) / 1680.0;
    id_timeout_resize = setTimeout(canvas_resize_timeout, 300);
    if (is_show_setting == true) {
        is_show_setting_tmp = is_show_setting;
        hideSetting();
    }
}
function canvas_resize_timeout() {
    $("#menu").animate({ 'zoom': scale_window }, { complete: canvas_resize_finished });
}
function canvas_resize_finished() {
    var windowInnerWidth = $("#draw").width();
    var windowInnerHeight = $("#draw").height();
    $("#materialview").css('height', $("#draw").height());

    var background_image = document.getElementById('image');
    background_image.setAttribute('width',windowInnerWidth);
    background_image.setAttribute('height',windowInnerHeight);

    var background_video = document.getElementById('video');
    background_video.setAttribute('width',windowInnerWidth);
    background_video.setAttribute('height',windowInnerHeight);

    var background_line = document.getElementById('line');
    var ctxLine = background_line.getContext("2d");
    var objectBackgroundTmp = ctxLine.getImageData(0, 0, background_line.width, background_line.height);
    var newCanvas = $("<canvas>")
        .attr("width", objectBackgroundTmp.width)
        .attr("height", objectBackgroundTmp.height)[0];
    background_line.setAttribute('width',windowInnerWidth);
    background_line.setAttribute('height',windowInnerHeight);
    newCanvas.getContext("2d").putImageData(objectBackgroundTmp, 0, 0);
    ctxLine.drawImage(newCanvas, 0, 0, windowInnerWidth, windowInnerHeight);

    cvs.setAttribute('width',windowInnerWidth);
    cvs.setAttribute('height',windowInnerHeight);

    resizeTimerText();

    if (background_type.includes("whiteboard")) {
        if (background_type == "whiteboard1") {
            drawBackground(imgDefaultTmp1);
        } else if (background_type == "whiteboard2") {
            drawBackground(imgDefaultTmp2);
        } else if (background_type == "whiteboard3") {
            drawBackground(imgDefaultTmp3);
        } else if (background_type == "whiteboard4") {
            drawBackground(imgDefaultTmp4);
        }
    } else if (background_type == "image") {
        if (imgBackgroundTmp != null) drawBackground(imgBackgroundTmp);
    }
    if (is_show_timer == true) {
    }
    if (is_show_setting_tmp == true || is_init == true) {
        if (is_init == true && localStorage.getItem("IMC_nextDisplay") != "true") $('.iframe')[0].click();
        $(".moveup").removeAttr('hidden').slideUp("fast", function() {
            is_show_setting_tmp = false; is_init = false; showSetting();
        });
    }
}
window.addEventListener('resize', canvas_resize, false);
canvas_resize();

function resizeTimerText() {
    var $frontmost = $("#frontmost");
    var height = $frontmost.height();
    var width = $frontmost.width();
    if (height === 0 || width === 0) return;
    $("#text").css('font-size', height < width ? height * 0.5 + "px" : width * 0.2 + "px");
}

/* ------------------------------------------------------------------------------------------------ */
var COOKIE_KEY_VISIT = "visit_date_pass";
var pass_data_visit;
function getNowTime(){
  nowDate = new Date();
  nowTime = nowDate.getTime();
}
function courseDate(n){
  getNowTime();
  course = nowTime - n;
  courseTime = Math.floor(course/(1000*60*60*24));
}
function remove_cookie(){
  $.removeCookie(COOKIE_KEY_VISIT);
  console.log("remove cookie.");
}
$(function(){
	return;	// count disabled
    cookieArr = $.cookie();
    var total = 0;
    var now = new Date();
    if (cookieArr[COOKIE_KEY_VISIT] == null) {
        firebase.database().ref('counts/total').once('value').then(function(snapshot) {
            if (snapshot.val() > 0) {
                total = snapshot.val() + 1;
            } else {
                console.log("The key was not found. >> total");
                remove_cookie();
                total = 1;
            }
            firebase.database().ref('counts/total').set(total);
            firebase.database().ref('counts/dates/' + total).set(now.toString());
            console.log("This is the first visit. >> total[" + total + "]");
        });
        reg_cookie_first();
    } else {
        pass_data_visit = $.cookie(COOKIE_KEY_VISIT);
        courseDate(pass_data_visit);
        $.cookie(COOKIE_KEY_VISIT, nowTime);
        if (courseTime > 0) {
            firebase.database().ref('counts/total').once('value').then(function(snapshot) {
                if (snapshot.val() > 0) {
                    total = snapshot.val() + 1;
                    firebase.database().ref('counts/total').set(total);
                    firebase.database().ref('counts/dates/' + total).set(now.toString());
                    console.log(courseTime + " day passed since the last visit. >> total[" + total + "]");
                } else {
                    reg_cookie_keynotfound(now, total);
                }
            });
        } else if (Number.isNaN(courseTime) == false) {
            firebase.database().ref('counts/total').once('value').then(function(snapshot) {
                if (snapshot.val() <= 0) reg_cookie_keynotfound(now, total);
            });
        } else {
            console.log("Database check failed.");
            remove_cookie();
            firebase.database().ref('counts/total').set(0);
        }
    }
});
function reg_cookie_first() {
    getNowTime();
    pass_data_visit = nowTime;
    courseDate(pass_data_visit);
    $.cookie(COOKIE_KEY_VISIT, pass_data_visit);
}
function reg_cookie_keynotfound(now, total) {
    console.log("The key was not found. >> total");
    remove_cookie();
    total = 1;
    firebase.database().ref('counts/total').set(total);
    firebase.database().ref('counts/dates/' + total).set(now.toString());
    reg_cookie_first();
    console.log(courseTime + " day passed since the last visit. >> total[" + total + "]");
}

/* ------------------------------------------------------------------------------------------------ */
var is_init = true;
var is_show_setting = false;
var is_show_setting_pen = false;
var is_show_setting_marker = false;
var is_show_setting_eraser = false;
var is_busy = false;
function showSetting() {
    if (is_show_setting == true) return;
    if (is_busy == true) return;
    is_busy = true;
    // Bootstrap 5 applies display:none!important to [hidden], so remove it
    // before using jQuery's animation methods.
    $("#menubackground").removeAttr('hidden').stop(true, true).slideDown(100, function() {
        $("#menumove").removeAttr('hidden').stop(true, true).fadeIn(100, function() {
            is_show_setting = true;
            is_busy = false;
        });
    });
    if (item_type != ITEM_TYPE.SELECT || background_type != "material") {
        $(".timer").removeAttr('hidden').stop(true, true).fadeIn(100, function() {
            if (is_show_timer == true) {
                $(".timersetting").removeAttr('hidden').stop(true, true).fadeIn(100, function() {});
            }
        });
    }
/*
    if (useBrowser == "chrome") {
        $(".login").stop(true, true).fadeIn(100, function() {});
    }
*/
}
function hideSetting() {
    if (is_show_setting == false) return;
    $("#submenu_pen").stop(true, true).slideUp("fast", function() {
        $("#submenu_marker").stop(true, true).slideUp("fast", function() {
            $("#submenu_eraser").stop(true, true).slideUp("fast", function() {
                $("#menumove").stop(true, true).fadeOut("fast", function() {
/*
                    if (useBrowser == "chrome") {
                        $(".login").stop(true, true).fadeOut("fast", function() {});
                    }
*/
                    $(".timersetting").stop(true, true).fadeOut("fast", function() {});
                    $(".timer").stop(true, true).fadeOut("fast", function() {});
                    $("#menubackground").stop(true, true).slideUp("fast", function() {
                        $(".moveup").removeAttr('hidden').slideDown("fast", function() {
                            is_show_setting = false;
                        });
                    });
                });
                is_show_setting_eraser = false;
            });
            is_show_setting_marker = false;
        });
        is_show_setting_pen = false;
    });
}
function showSettingPen() {
    if (scale_zoom != 1.0) return;
    $("#submenu_pen").removeAttr('hidden').stop(true, true).slideDown("fast", function() { is_show_setting_pen = true; });
}
function hideSettingPen() {
    $("#submenu_pen").stop(true, true).slideUp("fast", function() { is_show_setting_pen = false; });
}
function showSettingMarker() {
    if (scale_zoom != 1.0) return;
    $("#submenu_marker").removeAttr('hidden').stop(true, true).slideDown("fast", function() { is_show_setting_marker = true; });
}
function hideSettingMarker() {
    $("#submenu_marker").stop(true, true).slideUp("fast", function() { is_show_setting_marker = false; });
}
$(".pen_width").click(
    function() {
        document.getElementById('draw').style.display = "block";
        width_pen = parseInt($(this).attr("id").slice(-1));
        if (width_pen == 1) {
            $("#pen_width_1").attr('src', './' + useLanguage + '/images/SET_line1_S.png');
            $("#pen_width_2").attr('src', './' + useLanguage + '/images/SET_line2_P.png');
            $("#pen_width_3").attr('src', './' + useLanguage + '/images/SET_line3_P.png');
        } else if (width_pen == 2) {
            $("#pen_width_1").attr('src', './' + useLanguage + '/images/SET_line1_P.png');
            $("#pen_width_2").attr('src', './' + useLanguage + '/images/SET_line2_S.png');
            $("#pen_width_3").attr('src', './' + useLanguage + '/images/SET_line3_P.png');
        } else if (width_pen == 3) {
            $("#pen_width_1").attr('src', './' + useLanguage + '/images/SET_line1_P.png');
            $("#pen_width_2").attr('src', './' + useLanguage + '/images/SET_line2_P.png');
            $("#pen_width_3").attr('src', './' + useLanguage + '/images/SET_line3_S.png');
        }
        selectItemType(ITEM_TYPE.LINE_FREE_PEN);
        hideSettingPen();
    }
);
$(".pen_color").click(
    function() {
        document.getElementById('draw').style.display = "block";
        $("#pen_black").attr('src', './' + useLanguage + '/images/SET_color_BLACK_P.png');
        $("#pen_red").attr('src', './' + useLanguage + '/images/SET_color_RED_P.png');
        $("#pen_green").attr('src', './' + useLanguage + '/images/SET_color_GREEN_P.png');
        $("#pen_blue").attr('src', './' + useLanguage + '/images/SET_color_BLUE_P.png');
        $("#pen_yellow").attr('src', './' + useLanguage + '/images/SET_color_YELLOW_P.png');
        $("#pen_magenta").attr('src', './' + useLanguage + '/images/SET_color_MAGENTA_P.png');
        $("#pen_cyan").attr('src', './' + useLanguage + '/images/SET_color_CYAN_P.png');
        $("#pen_white").attr('src', './' + useLanguage + '/images/SET_color_WHITE_P.png');
        var color = $(this).attr("id");
        if (color == "pen_black") {
            color_pen = "rgba(0,0,0,1.0)";
            $("#pen_black").attr('src', './' + useLanguage + '/images/SET_color_BLACK_S.png');
        } else if (color == "pen_red") {
            color_pen = "rgba(255,0,0,1.0)";
            $("#pen_red").attr('src', './' + useLanguage + '/images/SET_color_RED_S.png');
        } else if (color == "pen_green") {
            color_pen = "rgba(0,255,0,1.0)";
            $("#pen_green").attr('src', './' + useLanguage + '/images/SET_color_GREEN_S.png');
        } else if (color == "pen_blue") {
            color_pen = "rgba(0,0,255,1.0)";
            $("#pen_blue").attr('src', './' + useLanguage + '/images/SET_color_BLUE_S.png');
        } else if (color == "pen_yellow") {
            color_pen = "rgba(255,255,0,1.0)";
            $("#pen_yellow").attr('src', './' + useLanguage + '/images/SET_color_YELLOW_S.png');
        } else if (color == "pen_magenta") {
            color_pen = "rgba(255,0,255,1.0)";
            $("#pen_magenta").attr('src', './' + useLanguage + '/images/SET_color_MAGENTA_S.png');
        } else if (color == "pen_cyan") {
            color_pen = "rgba(0,255,255,1.0)";
            $("#pen_cyan").attr('src', './' + useLanguage + '/images/SET_color_CYAN_S.png');
        } else if (color == "pen_white") {
            color_pen = "rgba(255,255,255,1.0)";
            $("#pen_white").attr('src', './' + useLanguage + '/images/SET_color_WHITE_S.png');
        }
        changePenIcon("S");
        hideSettingPen();
    }
);
function showSettingMarker() {
    if (scale_zoom != 1.0) return;
    $("#submenu_marker").removeAttr('hidden').stop(true, true).slideDown("fast", function() { is_show_setting_marker = true; });
}
function hideSettingMarker() {
    $("#submenu_marker").stop(true, true).slideUp("fast", function() { is_show_setting_marker = false; });
}
$(".marker_opacity").click(
    function() {
        document.getElementById('draw').style.display = "block";
        var opacity_id = $(this).attr("id");
        var opacity_str = opacity_id.replace("opacity_", "");
        opacity_marker = parseFloat(opacity_str , 10) / 10.0;
        hideSettingMarker();
    }
);
$(".marker_width").click(
    function() {
        document.getElementById('draw').style.display = "block";
        width_marker = parseInt($(this).attr("id").slice(-1));
        if (width_marker == 1) {
            $("#marker_width_1").attr('src', './' + useLanguage + '/images/SET_line1_S.png');
            $("#marker_width_2").attr('src', './' + useLanguage + '/images/SET_line2_P.png');
            $("#marker_width_3").attr('src', './' + useLanguage + '/images/SET_line3_P.png');
        } else if (width_marker == 2) {
            $("#marker_width_1").attr('src', './' + useLanguage + '/images/SET_line1_P.png');
            $("#marker_width_2").attr('src', './' + useLanguage + '/images/SET_line2_S.png');
            $("#marker_width_3").attr('src', './' + useLanguage + '/images/SET_line3_P.png');
        } else if (width_marker == 3) {
            $("#marker_width_1").attr('src', './' + useLanguage + '/images/SET_line1_P.png');
            $("#marker_width_2").attr('src', './' + useLanguage + '/images/SET_line2_P.png');
            $("#marker_width_3").attr('src', './' + useLanguage + '/images/SET_line3_S.png');
        }
        hideSettingMarker();
    }
);
$(".marker_color").click(
    function() {
        document.getElementById('draw').style.display = "block";
        $("#marker_black").attr('src', './' + useLanguage + '/images/SET_color_BLACK_P.png');
        $("#marker_red").attr('src', './' + useLanguage + '/images/SET_color_RED_P.png');
        $("#marker_green").attr('src', './' + useLanguage + '/images/SET_color_GREEN_P.png');
        $("#marker_blue").attr('src', './' + useLanguage + '/images/SET_color_BLUE_P.png');
        $("#marker_yellow").attr('src', './' + useLanguage + '/images/SET_color_YELLOW_P.png');
        $("#marker_magenta").attr('src', './' + useLanguage + '/images/SET_color_MAGENTA_P.png');
        $("#marker_cyan").attr('src', './' + useLanguage + '/images/SET_color_CYAN_P.png');
        $("#marker_white").attr('src', './' + useLanguage + '/images/SET_color_WHITE_P.png');
        var color = $(this).attr("id");
        if (color == "marker_black") {
            color_marker = "rgba(0,0,0," + opacity_marker.toFixed(1) + ")";
            $("#marker_black").attr('src', './' + useLanguage + '/images/SET_color_BLACK_S.png');
        } else if (color == "marker_red") {
            color_marker = "rgba(255,0,0," + opacity_marker.toFixed(1) + ")";
            $("#marker_red").attr('src', './' + useLanguage + '/images/SET_color_RED_S.png');
        } else if (color == "marker_green") {
            color_marker = "rgba(0,255,0," + opacity_marker.toFixed(1) + ")";
            $("#marker_green").attr('src', './' + useLanguage + '/images/SET_color_GREEN_S.png');
        } else if (color == "marker_blue") {
            color_marker = "rgba(0,0,255," + opacity_marker.toFixed(1) + ")";
            $("#marker_blue").attr('src', './' + useLanguage + '/images/SET_color_BLUE_S.png');
        } else if (color == "marker_yellow") {
            color_marker = "rgba(255,255,0," + opacity_marker.toFixed(1) + ")";
            $("#marker_yellow").attr('src', './' + useLanguage + '/images/SET_color_YELLOW_S.png');
        } else if (color == "marker_magenta") {
            color_marker = "rgba(255,0,255," + opacity_marker.toFixed(1) + ")";
            $("#marker_magenta").attr('src', './' + useLanguage + '/images/SET_color_MAGENTA_S.png');
        } else if (color == "marker_cyan") {
            color_marker = "rgba(0,255,255," + opacity_marker.toFixed(1) + ")";
            $("#marker_cyan").attr('src', './' + useLanguage + '/images/SET_color_CYAN_S.png');
        } else if (color == "marker_white") {
            color_marker = "rgba(255,255,255," + opacity_marker.toFixed(1) + ")";
            $("#marker_white").attr('src', './' + useLanguage + '/images/SET_color_WHITE_S.png');
        }
        changeMarkerIcon("S");
        hideSettingMarker();
    }
);
function showSettingEraser() {
    if (scale_zoom != 1.0) return;
    $("#submenu_eraser").removeAttr('hidden').stop(true, true).slideDown("fast", function() { is_show_setting_eraser = true; });
}
function hideSettingEraser() {
    $("#submenu_eraser").stop(true, true).slideUp("fast", function() { is_show_setting_eraser = false; });
}
$(document).on('click',function(e) {
   if (!$(e.target).closest('.pencil').length) {
       hideSettingPen();
   }
   if (!$(e.target).closest('.clearObject').length) {
       hideSettingEraser();
   }
});
$(".pencil").click(function(e) {
    document.getElementById('draw').style.display = "block";
    selectItemType(ITEM_TYPE.LINE_FREE_PEN);
    if (is_show_setting_pen == false) {
        hideSettingMarker();
        hideSettingEraser();
        showSettingPen();
    } else {
        hideSettingPen();
    }
});
$(".marker").click(function(e) {
    document.getElementById('draw').style.display = "block";
    selectItemType(ITEM_TYPE.LINE_FREE_MARKER);
    if (is_show_setting_marker == false) {
        hideSettingPen();
        hideSettingEraser();
        showSettingMarker();
    } else {
        hideSettingMarker();
    }
});
$('.clearObject').on('click', function(e) {
    document.getElementById('draw').style.display = "block";
    selectItemType(ITEM_TYPE.ERASER);
    if (is_show_setting_eraser == false) {
        hideSettingPen();
        hideSettingMarker();
        showSettingEraser();
    } else {
        hideSettingEraser();
    }
});
$('.clearAll').on('click', function(e) {
    $('#dom').off('click'); $('#dom').on('click', clear(e));
    document.getElementById('draw').style.display = "block";
    hideSettingEraser();
});
$(".selectitem").click(function() {
    if (background_type == "material") {
        $(".clearAll").trigger('click');
        document.getElementById('draw').style.display = "none";
    } else {
        document.getElementById('draw').style.display = "block";
    }
    selectItemType(ITEM_TYPE.SELECT);
/*
    selectItemType(ITEM_TYPE.ZOOM);
*/
});
$('#cameramode').click(function(e) {});
$('#wbmode1').on('click', function(e) {
    changeModeWhiteboard("whiteboard1");
});
$('#wbmode2').on('click', function(e) {
    changeModeWhiteboard("whiteboard2");
});
$('#wbmode3').on('click', function(e) {
    changeModeWhiteboard("whiteboard3");
});
$('#wbmode4').on('click', function(e) {
    changeModeWhiteboard("whiteboard4");
});
$('#transparent').on('click', function(e) {
    changeBackgroundBefore("transparent");
    changeBackgroundAfter("transparent", false);
});
$("#contentsmode").click(function () {
    setTimeout(function(){ $(selectContents).click(); }, 200);
});
$('.captureall').on('click', function(e) {
    download_image(0, 0, 0, 0);
});
/*
$('.capturearea').on('click', function(e) {
    selectAreaCapture();
});
*/
$('.recording').on('click', function(e) {
/*
    if (localStream == null) return;
*/
    if (is_recording == false) {
        startRecording();
    } else {
        stopRecording();
    }
});
$('.freeze').on('click', function(e) {
    freeze();
});
$('.rotation').on('click', function(e) {
    rotation(true);
});
/*
$('.insertimage').on('click', function(e) {
    insertimage("");
});
$('.text').on('click', function(e) {
    selectItemType(ITEM_TYPE.TEXT);
});
*/
function setPropertyText(in_font_size, in_font_family, in_font_weight, in_color_text, in_color_text_background) {
    if (in_font_size > 0) font_size_text = in_font_size;
    if (in_font_family != null) font_family_text = in_font_family;
    if (in_font_weight != null) font_weight_text = in_font_weight;
    if (in_color_text != null) color_text = in_color_text;
    if (in_color_text_background != null) color_text_background = in_color_text_background;
}
var menuposition_left = true;
$('.positionchange').on('click', function(e) {
    $('#footer').fadeOut("fast");
    $('#menulist').fadeOut("fast", function() {
        if (menuposition_left == true) {
            menuposition_left = false;
            $('.positionchange').attr('src', './' + useLanguage + '/images/Move_L_S.png');
            $('.menudown').attr('src', './' + useLanguage + '/images/Close_R_S.png');
            $('#menulist').css('float', 'right');
            $('#menulist').css('margin-right', '0px');
            $('#menulist li').css('float', 'right');
            $('#menulist li').css('margin-right', '0px');
            $('#menulist li').css('margin-left', '0px');
            $('#menuhide').css('margin-right', '0px');
            $('#menuhide').css('margin-left', '0px');
            $('#menupos').css('float', 'left');
            $('#menupos').css('margin-left', '-40px');
            $('#pen_style').children().each(function(i,li){$('#pen_style').prepend(li)});
            $('#pen_style').css('float', 'right');
            $('#pen_style').css('margin-right', '30px');
            $('#marker_style').children().each(function(i,li){$('#marker_style').prepend(li)});
            $('#marker_style').css('float', 'right');
            $('#marker_style').css('margin-right', '100px');
            $('#eraser_style').css('float', 'right');
            $('#eraser_style').css('margin-right', '180px');
            $('#menulist').fadeIn("fast");
            $('#footer').fadeIn("fast");
        } else {
            menuposition_left = true;
            $('.positionchange').attr('src', './' + useLanguage + '/images/Move_R_S.png');
            $('.menudown').attr('src', './' + useLanguage + '/images/Close_L_S.png');
            $('#menulist').css('float', 'left');
            $('#menulist').css('margin-left', '0px');
            $('#menulist li').css('float', 'left');
            $('#menulist li').css('margin-right', '0px');
            $('#menulist li').css('margin-left', '0px');
            $('#menuhide').css('margin-left', '-40px');
            $('#menuhide').css('margin-right', '10px');
            $('#menupos').css('float', 'right');
            $('#menupos').css('margin-right', '0px');
            $('#pen_style').children().each(function(i,li){$('#pen_style').prepend(li)});
            $('#pen_style').css('float', 'left');
            $('#pen_style').css('margin-left', '0px');
            $('#marker_style').children().each(function(i,li){$('#marker_style').prepend(li)});
            $('#marker_style').css('float', 'left');
            $('#marker_style').css('margin-left', '70px');
            $('#eraser_style').css('float', 'left');
            $('#eraser_style').css('margin-left', '140px');
            $('#menulist').fadeIn("fast");
            $('#footer').fadeIn("fast");
        }
    });
});
$(".menuup").click(function(e) {
    $(".moveup").slideUp("fast", function() {
        showSetting();
    });
});
$('.menudown').on('click', function(e) {
    hideSetting();
});
$('.speaker').on('click', function(e) {
    if (mode_current != MODE.VIDEO && is_find_audio == false) return;
    if (is_mute == false) {
        is_mute = true;
        $(".speaker").attr("src", "./" + useLanguage + "/images/Speaker_off.png");
    } else {
        is_mute = false;
        $(".speaker").attr("src", "./" + useLanguage + "/images/Speaker_on.png");
    }
    if (mode_current == deviceid) {
        changeModeCamera(deviceid);
    }
    if (mode_current == MODE.VIDEO) {
        changeModeVideo("");
    }
});
$('.fullscreen').on('click', function(e) {
    var fullscreenElement = document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.fullscreenElement;
    if (!fullscreenElement) {
        $('#fullscreen').fullscreen();
    } else {
        $.fullscreen.exit();
    }
});
document.addEventListener('webkitfullscreenchange', function(event) { checkFullscreen(); }, false);
document.addEventListener('mozfullscreenchange', function(event) { checkFullscreen(); }, false);
document.addEventListener('MSFullscreenChange', function(event) { checkFullscreen(); }, false);
document.addEventListener('fullscreenchange', function(event) { checkFullscreen(); }, false);
function checkFullscreen() {
    var fullscreenElement = document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.fullscreenElement;
    console.log(fullscreenElement);
    if (fullscreenElement) {
        $(".fullscreen").attr('src', './' + useLanguage + '/images/FullScreen_OFF.png');
    } else {
        $(".fullscreen").attr('src', './' + useLanguage + '/images/FullScreen.png');
    }
}
$('.help').on('click', function(e) {
/*
    if (list_selecteditem_compare.length == 0) {
        changeModeCompare(["file:///C:/Users/Public/Pictures/Sample Pictures/Chrysanthemum.jpg", "file:///C:/Users/Public/Pictures/Sample Pictures/Hydrangeas.jpg", "file:///C:/Users/Public/Pictures/Sample Pictures/Jellyfish.jpg", "file:///C:/Users/Public/Pictures/Sample Pictures/Koala.jpg", "file:///C:/Users/Public/Pictures/Sample Pictures/Lighthouse.jpg", "file:///C:/Users/Public/Pictures/Sample Pictures/Penguins.jpg", "file:///C:/Users/Public/Pictures/Sample Pictures/Tulips.jpg"]);
    } else {
        showSelectedItemCompare();
    }
*/
});
var timer_set = "";
var timer_set_min = "";
var timer_set_sec = "";
$("#timer").click(function () { settimer(); });
$("#timersetting_startstop").click(function () {
    if (id_timeout_timer == 0) {
        starttimer();
    } else {
        stoptimer();
    }
});
$("#timersetting_reset").click(function () { resettimer(); });
$("#timersetting_1min").click(function () { timersetting_set("1"); });
$("#timersetting_3min").click(function () { timersetting_set("3"); });
$("#timersetting_5min").click(function () { timersetting_set("5"); });
function timersetting_set(num) {
    if (id_timeout_timer != 0) return;
    timer_set += num;
    addtimercount(null, parseInt(timer_set) * 60 * 1000);
    timer_set_min = timer_set;
    timer_set = "";
}
/*
$("#login").click(function () {
    if (AuthUI.data.authed == false) {
        if (canvas._objects.length > 0 || objs_camera.length > 0 || objs_wb1.length > 0 || objs_wb2.length > 0 || objs_wb3.length > 0 || objs_wb4.length > 0 || objs_transparent.length > 0 || objs_image.length > 0 || objs_video.length > 0 || objs_material.length > 0) {
            if (!confirm(TEXT_CONFIRM_RELOAD)) return;
        }
    }
    AuthUI.doAuth();
});
*/
/* ------------------------------------------------------------------------------------------------ */
var clientId = "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com";
var appId = "1234567890";
var scope = ['https://www.googleapis.com/auth/drive'];
var pickerApiLoaded = false;
var oauthToken;
var is_busy_loadpicker = false;
var is_manual_auth = false;
/*
$(".auth").click(function () {
    is_manual_auth = true;
    $("#main").fadeIn(100, function() { $("#auth").fadeOut("fast"); });
    window.gapi.auth.authorize(
    {
        'client_id': clientId,
        'scope': scope,
        'immediate': false
    }, handleAuthResult);
});
function loadPicker() {
    if (pickerApiLoaded == false && is_busy_loadpicker == false) {
        is_busy_loadpicker = true;
        firebase.database().ref('client_id').once('value').then(function(id) {
            clientId = id.val();
            firebase.database().ref('app_id').once('value').then(function(number) {
                appId = number.val();
                gapi.load('picker', {'callback': onPickerApiLoad});
            });
        });
    }
}
function onPickerApiLoad() {
    pickerApiLoaded = true;
    is_busy_loadpicker = false;
    gapi.load('auth', {'callback': onAuthApiLoad});
}
function onAuthApiLoad() {
    window.gapi.auth.authorize(
    {
        'client_id': clientId,
        'scope': scope,
        'immediate': true
    }, handleAuthResult);
}
function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        if (is_manual_auth == true) {
            is_manual_auth = false;
            AuthUI.doAuth();
        }
    } else if (is_manual_auth == false) {
        AuthUI.doAuth();
        $("#auth").removeAttr('hidden').fadeIn(100, function() { $("#main").fadeOut("fast"); });
    }
    is_manual_auth = false;
    $('#login').attr('src', pickerApiLoaded && oauthToken ? './' + useLanguage + '/images/Logout.png' : './' + useLanguage + '/images/Login.png');
}
*/
function createPicker() {
    if (pickerApiLoaded && oauthToken) {
        var view = new google.picker.View(google.picker.ViewId.DOCS);
/*
        view.setMimeTypes("image/png,image/jpeg,image/jpg,video/webm,video/mp4,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation");
*/
        var viewUpload = new google.picker.DocsUploadView();
        var picker = new google.picker.PickerBuilder()
/*
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
*/
            .addView(view)
            .addView(viewUpload)
            .setLocale(language)
            .setOAuthToken(oauthToken)
            .setOrigin(window.location.protocol + '//' + window.location.host)
            .setAppId(appId)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }
}
function pickerCallback(data) {
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        var url = doc[google.picker.Document.URL];
        $('select[name=selectedMode]').val(MODE.DRIVE);
        $('#modeList').modePicker("refresh");
        changeModeMaterial(url);
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    } else {
        $('select[name=selectedMode]').val(MODE.WHITEBOARD1);
        $('#modeList').modePicker("refresh");
        changeMode();
    }
}
/*
const api_key = ``;
const url = `https://vision.googleapis.com/v1/images:annotate`;
var recognition_type = 'FACE_DETECTION';
const sendAPI = (base64string) => {
    let body = {
        requests: [
          {image: {content: base64string}, features: [{type: recognition_type}]}
        ]
    };
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${url}?key=${api_key}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const p = new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => {
        if (xhr.readyState != XMLHttpRequest.DONE) return;
        if (xhr.status >= 400) return reject({message: `Failed with ${xhr.status}:${xhr.statusText}`});
        resolve(JSON.parse(xhr.responseText));
    };
    });
    xhr.send(JSON.stringify(body));
    return p;
};
const readFile = (file) => {
    let reader = new FileReader();
    const p = new Promise((resolve, reject) => {
        reader.onload = (ev) => {
            resolve(ev.target.result.replace(/^data:image\/(png|jpeg);base64,/, ''));
        };
    });
    reader.readAsDataURL(file);
    return p;
};
function facerecognition() {
    freeze();
    var blob = base64ToBlob(canvas.toDataURL());
    recognition_type = 'FACE_DETECTION';
    Promise.resolve(blob)
    .then(readFile)
    .then(sendAPI)
    .then(res => {
        var res_json = JSON.stringify(res, null, 2).toString();
        if (res_json.includes("\"joyLikelihood\": \"VERY_LIKELY\"")) {
        } else if (res_json.includes("\"joyLikelihood\": \"LIKELY\"") || res_json.includes("\"joyLikelihood\": \"POSSIBLE\"")) {
        } else if (res_json.includes("\"sorrowLikelihood\": \"VERY_LIKELY\"")) {
        } else if (res_json.includes("\"angerLikelihood\": \"VERY_LIKELY\"")) {
        } else if (res_json.includes("\"surpriseLikelihood\": \"VERY_LIKELY\"")) {
        } else {
        }
    }).catch(err => {
        console.log('FAILED:(', err);
    });
    freeze();
};
*/
/* ------------------------------------------------------------------------------------------------ */
function clear(e) {
    e.preventDefault();
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    var ctxLine = document.getElementById('line').getContext("2d");
    ctxLine.clearRect(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    if (background_type == "camera" || background_type == "video" || background_type == "transparent") {
        var background_image = document.getElementById('image');
        background_image.getContext("2d").fillStyle = "black";
        background_image.getContext("2d").fillRect(0, 0, background_image.width, background_image.height);
    } else if (background_type.includes("whiteboard")) {
        if (background_type == "whiteboard1") {
            drawBackground(imgDefaultTmp1);
        } else if (background_type == "whiteboard2") {
            drawBackground(imgDefaultTmp2);
        } else if (background_type == "whiteboard3") {
            drawBackground(imgDefaultTmp3);
        } else if (background_type == "whiteboard4") {
            drawBackground(imgDefaultTmp4);
        }
    } else if (background_type == "image") {
        drawBackground(imgBackgroundTmp);
    }
    if (is_show_timer == true) {
    }
    $(".pencil").trigger('click');
}

/* ------------------------------------------------------------------------------------------------ */
var mode_current = MODE.WHITEBOARD1;
function changeMode() {
    obj = document.modeList.selectedMode;
    var index = obj.selectedIndex;
    var mode = obj.options[index].value;
    if (mode == MODE.WHITEBOARD1) {
        $('#wbmode1').trigger('click');
        mode_current = mode;
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    } else if (mode == MODE.WHITEBOARD2) {
        $('#wbmode2').trigger('click');
        mode_current = mode;
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    } else if (mode == MODE.WHITEBOARD3) {
        $('#wbmode3').trigger('click');
        mode_current = mode;
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    } else if (mode == MODE.WHITEBOARD4) {
        $('#wbmode4').trigger('click');
        mode_current = mode;
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    } else if (mode == MODE.TRANSPARENT) {
        $('#transparent').trigger('click');
        mode_current = mode;
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    } else if (mode == MODE.CONTENTS) {
        $('select[name=selectedMode]').val(mode_current);
        $('#modeList').modePicker("refresh");
        $('#contentsmode').trigger('click');
    } else if (mode == MODE.IMAGE) {
        changeModeImage("");
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeIn("fast");
        $(".freeze").fadeOut("fast");
    } else if (mode == MODE.VIDEO) {
        changeModeVideo("");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeIn("fast");
        $(".freeze").fadeIn("fast");
    } else if (mode == MODE.URL) {
        var path = prompt(TEXT_INPUT_URL, "");
        if ((path == null || path == "") || (USE_LOCAL == false && !path.includes("http"))) {
            if (urlBackgroundTmp == null) {
                $('select[name=selectedMode]').val(MODE.WHITEBOARD1);
                $('#modeList').modePicker("refresh");
                changeMode();
                return;
            } else {
                path = "";
            }
        }
        changeModeMaterial(path);
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    } else if (mode == MODE.DRIVE) {
        createPicker();
    } else if (mode == MODE.MATERIAL) {
        changeModeMaterial(materialBackgroundTmp);
    } else {
        var label = obj.options[index].id;
		if (isDocCam(label) == true) {
            setResolutionCamera(1920, 1080);
			if(useOS == "Mac OS" && (label == "OX-1" || label == "EX-1"
			|| label == "PX-30/PX-10" || label == "L-12F")){
				setResolutionCamera(1600, 1200);	// 16:9だけ何故かYUVになって使い物にならないので4:3(UXGA)に変更
			}
        } else {
            setResolutionCamera(1280, 720);
        }
        changeModeCamera(mode);
    }
}
$('#mode').on('change', function() {
    changeMode();
}).on('show.modePicker', function () {
    hideSettingPen();
    hideSettingMarker();
    hideSettingEraser();
    if (useBrowser == "safari_not_support_webrtc") {
    } else {
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(errorCallback);
    }
});
function changeBackgroundBefore(type) {
    if (is_recording == true) {
        alert(TEXT_RECORDING_END);
        stopRecording();
    }
    if (localStream != null) stopVideo();
    if (mode_current == MODE.VIDEO) {
        var background_video = document.getElementById('video');
        background_video.pause();
        background_video.src = '';
        background_video.srcObject = null;
    }
    if (is_freeze == true) freeze();
    if (angle_rotation == 180) rotation(false);
    if ($("input[type=range]").val() != 1.0) $("input[type=range]").val(1.0).change();
    if (is_show_timer == true) settimer();

    var ctxLine = document.getElementById('line').getContext("2d");
    if (background_type == "camera") {
        imgDataTmpCamera = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "whiteboard1") {
        imgDataTmpWhiteboard1 = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "whiteboard2") {
        imgDataTmpWhiteboard2 = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "whiteboard3") {
        imgDataTmpWhiteboard3 = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "whiteboard4") {
        imgDataTmpWhiteboard4 = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "transparent") {
        imgDataTmpTransparent = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "image") {
        imgDataTmpImage = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "video") {
        imgDataTmpVideo = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    } else if (background_type == "material") {
        imgDataTmpMaterial = ctxLine.getImageData(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    }
    ctxLine.clearRect(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
}
function changeBackgroundAfter(type, clear_objs) {
    if (type == "camera" || type == "video") {
        $("#background").css('background-color', 'black');
        document.getElementById('video').style.display = "block";
        document.getElementById('image').style.display = "none";
    } else {
        $("#background").css('background-color', 'transparent');
        document.getElementById('video').style.display = "none";
        document.getElementById('image').style.display = "block";
    }
    var ctxLine = document.getElementById('line').getContext("2d");
    ctxLine.clearRect(0, 0, ctxLine.canvas.width, ctxLine.canvas.height);
    if (clear_objs == true) {
        if (type == "camera") {
            imgDataTmpCamera = null;
        } else if (type == "whiteboard1") {
            imgDataTmpWhiteboard1 = null;
        } else if (type == "whiteboard2") {
            imgDataTmpWhiteboard2 = null;
        } else if (type == "whiteboard3") {
            imgDataTmpWhiteboard3 = null;
        } else if (type == "whiteboard4") {
            imgDataTmpWhiteboard4 = null;
        } else if (type == "transparent") {
            imgDataTmpTransparent = null;
        } else if (type == "image") {
            imgDataTmpImage = null;
        } else if (type == "video") {
            imgDataTmpVideo = null;
        } else if (type == "material") {
            imgDataTmpMaterial = null;
        }
    } else {
        if (type == "camera" && imgDataTmpCamera != null) {
            ctxLine.putImageData(imgDataTmpCamera, 0, 0);
        } else if (type == "whiteboard1" && imgDataTmpWhiteboard1 != null) {
            ctxLine.putImageData(imgDataTmpWhiteboard1, 0, 0);
        } else if (type == "whiteboard2" && imgDataTmpWhiteboard2 != null) {
            ctxLine.putImageData(imgDataTmpWhiteboard2, 0, 0);
        } else if (type == "whiteboard3" && imgDataTmpWhiteboard3 != null) {
            ctxLine.putImageData(imgDataTmpWhiteboard3, 0, 0);
        } else if (type == "whiteboard4" && imgDataTmpWhiteboard4 != null) {
            ctxLine.putImageData(imgDataTmpWhiteboard4, 0, 0);
        } else if (type == "transparent" && imgDataTmpTransparent != null) {
            ctxLine.putImageData(imgDataTmpTransparent, 0, 0);
        } else if (type == "image" && imgDataTmpImage != null) {
            ctxLine.putImageData(imgDataTmpImage, 0, 0);
        } else if (type == "video" && imgDataTmpVideo != null) {
            ctxLine.putImageData(imgDataTmpVideo, 0, 0);
        } else if (type == "material" && imgDataTmpMaterial != null) {
            ctxLine.putImageData(imgDataTmpMaterial, 0, 0);
        }
    }
    background_type = type;
    if (type == "material") {
        $("#materialview").css('height', $("#draw").height());
        document.getElementById('draw').style.display = "none";
        clearTimeout(id_timeout_setitemtype);
        selectItemType(ITEM_TYPE.SELECT);
        $("input[type=range]").fadeOut("fast");
        $('.selectitem').fadeOut("fast");
        $(".captureall").fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
        $(".speaker").fadeOut("fast");
        $(".timer").fadeOut("fast");
    } else {
        document.getElementById('draw').style.display = "block";
        $("input[type=range]").fadeIn("fast");
        $(".captureall").fadeIn("fast");
        if (is_show_setting == true) {
            $(".timer").stop(true, true).fadeIn(100, function() {
                if (is_show_timer == true) {
                    $(".timersetting").stop(true, true).fadeIn(100, function() {});
                }
            });
        }
    }
    if (type == "camera" || type == "video") {
        $(".speaker").stop(true, true).fadeIn(100, function() {});
    } else {
        $(".speaker").stop(true, true).fadeOut("fast", function() {});
    }
}

/* ------------------------------------------------------------------------------------------------ */
function changeModeWhiteboard(type) {
    changeBackgroundBefore(type);
    if (type == "whiteboard1") {
        drawBackground(imgDefaultTmp1);
    } else if (type == "whiteboard2") {
        drawBackground(imgDefaultTmp2);
    } else if (type == "whiteboard3") {
        drawBackground(imgDefaultTmp3);
    } else if (type == "whiteboard4") {
        drawBackground(imgDefaultTmp4);
    } else {
        return false;
    }
    background_width = cvs.width;
    background_height = cvs.height;
    changeBackgroundAfter(type, false);
    return true;
}
function changeBackground(index, filepath) {
    if (index < 1 && 4 < index) return;
    var img = null;
    var background_image = document.getElementById('image');
    if (filepath == null || filepath == "") {
        background_image.getContext("2d").fillStyle = "white";
        background_image.getContext("2d").fillRect(0, 0, background_image.width, background_image.height);
    } else {
        img = new Image();
        img.onload = function() {
            var canvasAspect = cvs.width / cvs.height;
            var imgAspect = img.width / img.height;
            var left, top, scaleFactor;
            if (canvasAspect <= imgAspect) {
                scaleFactor = cvs.width / img.width;
                left = 0;
                top = -((img.height * scaleFactor) - cvs.height) / 2;
            } else {
                scaleFactor = cvs.height / img.height;
                top = 0;
                left = -((img.width * scaleFactor) - cvs.width) / 2;
            }
            var ang = 180;
            background_image.getContext("2d").fillStyle = "black";
            background_image.getContext("2d").fillRect(0, 0, background_image.width, background_image.height);
            background_image.getContext("2d").drawImage(img, 0, 0, img.width, left, top, img.width * scaleFactor, img.height * scaleFactor);
        };
        img.src = filepath;
    }
    if (index == 1) {
        imgDefaultTmp1 = img;
    } else if (index == 2) {
        imgDefaultTmp2 = img;
    } else if (index == 3) {
        imgDefaultTmp3 = img;
    } else if (index == 4) {
        imgDefaultTmp4 = img;
    }
}

/* ------------------------------------------------------------------------------------------------ */
function clearFilePath(e) { this.value = null; }
window.addEventListener("DOMContentLoaded", function() {
    selectContents.addEventListener("change", function(evt) {
        var img = null;
        var file = evt.target.files;
        var reader = new FileReader();
        var blob = file[0];
        reader.readAsDataURL(blob);
        reader.onload = function() {
            var file_type = blob.type;
            if (file_type.toLowerCase().indexOf("image") >= 0) {
                changeBackgroundBefore("image");
                img = new Image();
                img.onload = function() {
                    drawBackground(img);
                };
                img.src = reader.result;
                imgBackgroundTmp = img;
                var modeList = document.getElementById('modeList');
                obj = document.modeList.selectedMode;
                for (var i = 0; i < modeList.length; i++) {
                    if (obj.options[i].value == "image") {
                        modeList.remove(i);
                        break;
                    }
                }
                $('#modeList').append('<option id="image" value="image" data-content="<img src=\'' + reader.result + '\' style=\'width:40px; height:30px; margin-top:5px; margin-bottom:5px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_CONTENTS_IMAGE + '</span>"></option>');
                $('select[name=selectedMode]').val(MODE.IMAGE);
                $('#modeList').modePicker("refresh");
                mode_current = "image";
                changeBackgroundAfter("image", true);
            } else if (file_type.toLowerCase().indexOf("video/mp4") >= 0 || file_type.toLowerCase().indexOf("video/webm") >= 0) {
                changeBackgroundBefore("video");
                var background_video = document.querySelector('video');
                $("video").prop('muted', is_mute);
                background_video.src = reader.result;
                background_video.onloadedmetadata = function(e) {
                    background_video.play();
                };
                videoBackgroundTmp = reader.result;
                var modeList = document.getElementById('modeList');
                obj = document.modeList.selectedMode;
                for (var i = 0; i < modeList.length; i++) {
                    if (obj.options[i].value == "video") {
                        modeList.remove(i);
                        break;
                    }
                }
                $('#modeList').append('<option id="video" value="video" data-content="<img src=\'./' + useLanguage + '/images/Movie.png\' style=\'width:40px; height:40px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_CONTENTS_VIDEO + '</span>"></option>');
                $('select[name=selectedMode]').val(MODE.VIDEO);
                $('#modeList').modePicker("refresh");
                mode_current = "video";
                changeBackgroundAfter("video", true);
            }
            $('.selectitem').fadeOut("fast");
            $('.recording').fadeOut("fast");
            $(".rotation").fadeIn("fast");
            if (background_type == "video") {
                $(".freeze").fadeIn("fast");
            } else {
                $(".freeze").fadeOut("fast");
            }
            selectContents.value = '';
        };
    }, false);
    selectInsertImage.addEventListener("change", function(evt) {
        var img = null;
        var file = evt.target.files;
        var reader = new FileReader();
        var blob = file[0];
        reader.readAsDataURL(blob);
        reader.onload = function() {
            var file_type = blob.type;
            if (file_type.toLowerCase().indexOf("image") >= 0) {
                img = new Image();
                img.onload = function() {
                    console.log("load inser image");
                };
                imgInsertPath = reader.result;
            }
        };
        selectInsertImage.value = '';
    }, false);
});
function drawBackground(img) {
    var background_image = document.getElementById('image');
    if (img == null) {
        background_image.getContext("2d").fillStyle = "white";
        background_image.getContext("2d").fillRect(0, 0, background_image.width, background_image.height);
        return;
    }
    var canvasAspect = cvs.width / cvs.height,
    imgAspect = img.width / img.height,
    width, height;
    if (imgAspect >= canvasAspect) {
        width = cvs.width;
        height = cvs.width / imgAspect;
    } else {
        height = cvs.height;
        width = cvs.height * imgAspect;
    }
    background_width = width;
    background_height = height;

    var left, top, scaleFactor;
    if (canvasAspect <= imgAspect) {
        scaleFactor = cvs.width / img.width;
        left = 0;
        top = -((img.height * scaleFactor) - cvs.height) / 2;
    } else {
        scaleFactor = cvs.height / img.height;
        top = 0;
        left = -((img.width * scaleFactor) - cvs.width) / 2;
    }
    background_image.getContext("2d").clearRect(0, 0, background_image.width, background_image.height);
    background_image.getContext("2d").fillStyle = "black";
    background_image.getContext("2d").fillRect(0, 0, background_image.width, background_image.height);
    background_image.getContext("2d").drawImage(img, 0, 0, img.width, img.height, left, top, width, height);
}
function changeModeImage(filepath) {
    if (filepath == "" && imgBackgroundTmp != null) {
        changeBackgroundBefore("image");
        drawBackground(imgBackgroundTmp);
        mode_current = MODE.IMAGE;
        changeBackgroundAfter("image", background_type == "image" ? true : false);
    } else if (filepath != "") {
        changeBackgroundBefore("image");
        var img = new Image();
        img.onload = function() {
            drawBackground(img);
        };
        img.src = filepath;
        imgBackgroundTmp = img;
        mode_current = MODE.IMAGE;
        changeBackgroundAfter("image", background_type == "image" ? true : false);
    } else {
        console.log("changeModeImage error >> " + filepath);
        return false;
    }
    return true;
}
function changeModeVideo(filepath) {
    var background_video = document.querySelector('video');
    if (filepath == "" && videoBackgroundTmp != null) {
        changeBackgroundBefore("video");
        $("video").prop('muted', is_mute);
        background_video.src = videoBackgroundTmp;
        background_video.onloadedmetadata = function(e) {
            background_video.play();
        };
        mode_current = MODE.VIDEO;
        changeBackgroundAfter("video", false);
    } else if (filepath != "") {
        changeBackgroundBefore("video");
        $("video").prop('muted', is_mute);
        background_video.src = filepath;
        background_video.onloadedmetadata = function(e) {
            video.play();
        };
        videoBackgroundTmp = reader.result;
        mode_current = MODE.VIDEO;
        changeBackgroundAfter("video", false);
    } else {
        console.log("changeModeVideo error >> " + filepath);
        return false;
    }
    return true;
}
function changeModeMaterial(filepath) {
    if (filepath != "" || (filepath == "" && materialBackgroundTmp != null)) {
        var set = "";
        if (filepath == "") filepath = materialBackgroundTmp;
        changeBackgroundBefore("material");
        $('#materialview').remove();
        var set = "";
        if (filepath.includes("https://drive.google.com/file/d/") && filepath.includes("/view?usp=drive_web")) {
            set = '<iframe id="materialview" src="' + filepath.replace("/view?usp=drive_web", "/preview") + '" width="100%" style="margin-top:-10px; margin-bottom:-10px; border: none;"></iframe>';
        } else if (filepath.includes("https://drive.google.com/file/d/") && filepath.includes("/view?usp=sharing")) {
            set = '<iframe id="materialview" src="' + filepath.replace("/view?usp=sharing", "/preview") + '" width="100%" style="margin-top:-10px; margin-bottom:-10px; border: none;"></iframe>';
        } else if (filepath.includes("http")) {
            set = '<iframe id="materialview" src="https://docs.google.com/viewer?url=' + filepath + '&embedded=true" width="100%" style="margin-top:-10px; margin-bottom:-10px; border: none;"></iframe>';
        } else if (filepath.includes(".pdf")) {
            set = '<iframe id="materialview" src="' + filepath + '" width="100%" style="margin-top:-10px; margin-bottom:-10px; border: none;"></iframe>';
        }
        if (set != "") $('#background').append(set);
        materialBackgroundTmp = filepath;
        var modeList = document.getElementById('modeList');
        obj = document.modeList.selectedMode;
        for (var i = 0; i < modeList.length; i++) {
            if (obj.options[i].value == "material") {
                modeList.remove(i);
                break;
            }
        }
        $('#modeList').append('<option id="material" value="material" data-content="<img src=\'./' + useLanguage + '/images/MATERIAL.png\' style=\'width:40px; height:30px; margin-top:5px; margin-bottom:5px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MATERIAL + '</span>"></option>');
        $('select[name=selectedMode]').val(MODE.MATERIAL);
        $('#modeList').modePicker("refresh");
        mode_current = MODE.MATERIAL;
        changeBackgroundAfter("material", false);
    } else {
        console.log("changeModeMaterial error >> " + filepath);
        return false;
    }
    return true;
}

/* ------------------------------------------------------------------------------------------------ */
let localStream;
var camcount = 1;
var recorder = null;
var timer_facerocognition;
var list_reject_device = [];
var list_valid_device = [];
var map_device = {};
var is_init_checked = false;
var is_find_audio = false;
function gotDevices(deviceInfos) {
    camcount = 1;
    var modeList = document.getElementById('modeList');
    obj = document.modeList.selectedMode;
    for (var i = 0; i < modeList.length; i++) {
        if (!obj.options[i].value.includes("Whiteboard") &&
            obj.options[i].value != MODE.TRANSPARENT &&
            obj.options[i].value != MODE.CONTENTS && obj.options[i].value != MODE.IMAGE && obj.options[i].value != MODE.VIDEO && obj.options[i].value != MODE.URL && obj.options[i].value != MODE.MATERIAL) {
            modeList.remove(i);
            i--;
        }
    }
    if (AuthUI.data.authed == true && pickerApiLoaded && oauthToken) {
        $('#modeList').append('<option id="drive" value="drive" data-content="<img src=\'./' + useLanguage + '/images/drive_48dp.png\' style=\'width:40px; height:40px;\'>&nbsp;<span style=\'display:inline-block;\'>' + TEXT_MODE_DRIVE + '</span>"></option>');
        if (mode_current == MODE.DRIVE) $('select[name=selectedMode]').val(MODE.DRIVE);
    }
    $('#modeList').modePicker("refresh");
/*
    deviceid = null;
*/
    var founddeviceid = false;
    var is_label_empty = false;
    var is_change_cameramode = false;
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        if (list_reject_device.includes(deviceInfo.deviceId)) continue;
        var option = document.createElement('option');
        option.value = deviceInfo.deviceId;

        console.log("deviceId::" + deviceInfo.deviceId);
        console.log("groupId::" + deviceInfo.groupId);
        console.log("kind::" + deviceInfo.kind);
        console.log("label::" + deviceInfo.label);

        if (deviceInfo.kind === 'videoinput') {
            if (deviceid == null) {
                deviceid = deviceInfo.deviceId;
            } else if (deviceid == deviceInfo.deviceId) {
                founddeviceid = true;
            }
            if (camcount > 1) {
                option.text = deviceInfo.label || TEXT_MODE_CAMERA + ' ' + camcount;
            } else {
                option.text = deviceInfo.label || TEXT_MODE_CAMERA;
            }
            if (list_valid_device.length > 0) {
                list_valid_device.forEach(function(val, index, ar) {
                    var list = val.split("::");
                    if (deviceInfo.deviceId == list[0] && option.text.includes(TEXT_MODE_CAMERA)) option.text = list[1];
                });
            }
            if ((useOS == "iOS" || useBrowser == "safari") && !option.text.includes(TEXT_MODE_CAMERA)) option.text += "_";
            var label = getCameraName(option.text);
            if (option.text != label && is_init_checked == false) {
                if (is_change_cameramode == false || deviceInfo.label.includes("(09a1:") == true) {
                    deviceid = deviceInfo.deviceId;
                }
                is_change_cameramode = true;
            }
            if (option.text != label || label.includes(TEXT_MODE_CAMERA)) {
                option.text = label;
                $('#modeList').append('<option id="' + option.text + '" value="' + option.value + '" data-content="<img src=\'./' + useLanguage + '/images/CAMERA.png\' style=\'width:40px; height:40px;\'>&nbsp;<span style=\'display:inline-block;\'>' + option.text + '</span>"></option>');
                $('#modeList').modePicker("refresh");
                camcount++;
                if (is_label_empty == false) {
                    is_label_empty = label.includes(TEXT_MODE_CAMERA) || (USE_LOCAL == true && list_valid_device.length == 0) ? true : false;
                }
            }
        } else if (deviceInfo.kind === 'audioinput') {
            is_find_audio = true;
        }
    }
    if (!mode_current.includes("Whiteboard") && mode_current != MODE.TRANSPARENT && mode_current != MODE.IMAGE && mode_current != MODE.VIDEO && mode_current != MODE.URL && mode_current != MODE.DRIVE && mode_current != MODE.MATERIAL && founddeviceid == false) {
        $('#wbmode1').trigger('click');
        mode_current = MODE.WHITEBOARD1;
        $('.selectitem').fadeOut("fast");
        $('.recording').fadeOut("fast");
        $(".rotation").fadeOut("fast");
        $(".freeze").fadeOut("fast");
    }
    if (!mode_current.includes("Whiteboard") && mode_current != MODE.TRANSPARENT && mode_current != MODE.IMAGE && mode_current != MODE.VIDEO && mode_current != MODE.URL && mode_current != MODE.DRIVE && mode_current != MODE.MATERIAL) {
        $('select[name=selectedMode]').val(mode_current);
        $('#modeList').modePicker("refresh");
    }
    if (is_label_empty == true) {
        startVideo(0, 0, false);
    } else if (is_change_cameramode == true && is_init_checked == false) {
        $('select[name=selectedMode]').val(deviceid);
        $('#modeList').modePicker("refresh");
	    obj = document.modeList.selectedMode;
	    var index = obj.selectedIndex;
        var label = obj.options[index].id;
        if (isDocCam(label) == true) {
            setResolutionCamera(1920, 1080);
			if(useOS == "Mac OS" && (label == "OX-1" || label == "EX-1"
			|| label == "PX-30/PX-10" || label == "L-12F")){
				setResolutionCamera(1600, 1200);	// 16:9だけ何故かYUVになって使い物にならないので4:3(UXGA)に変更
			}
        } else {
            setResolutionCamera(1280, 720);
        }
        changeModeCamera(deviceid);
    }
    is_init_checked = true;
}
function isCheckDeviceName() {
    if (useOS == "iOS" || useOS.includes("Android")) return false;
    return true;
}
function errorCallback(error) {
    console.log('navigator.getUserMedia error: ', error);
}
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(errorCallback);
function startVideo(w, h, retry) {
    if (localStream != null) {
        stopVideo();
    }
    navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
        getUserMedia: function(c) {
            return new Promise(function(y, n) {
                (navigator.mozGetUserMedia ||
                navigator.webkitGetUserMedia).call(navigator, c, y, n);
            });
        }
    } : null);
    if (!navigator.mediaDevices) {
        console.log("getUserMedia() not supported.");
        return;
    }
    if (w == 0 && h == 0 && retry == false) {
    } else if (useBrowser == "safari") {
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(errorCallback);
    }
    var constraints = { audio: false, video: { width: { min: w }, height: { min: h } } };
    var is_enable_audio = is_mute == false && is_find_audio == true ? true : false;
    if (useBrowser == "safari") {
        if (w == 0 && h == 0) {
            constraints = { audio: is_enable_audio, video:{ deviceId: { exact: [deviceid] } }};
        } else {
            constraints = { audio: is_enable_audio, video: { width: { min: w }, height: { min: h }, deviceId: { exact: [deviceid] } } };
        }
    } else {
        if (deviceid != null && w != 0 && h != 0) {
            constraints = { audio: is_enable_audio, video: { width: { min: w }, height: { min: h }, deviceId: { exact: [deviceid] } } };
        } else if (w == 0 && h == 0) {
            constraints = { audio: is_enable_audio, video:{ deviceId: deviceid }};
        } else {
            constraints = { audio: is_enable_audio, video:{}};
            constraints.video.facingMode = {exact:"environment"}
        }
    }
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        var videoTracks = stream.getVideoTracks();
        console.log('Using video device :: ' + videoTracks[0].label + ", resolution :: " + w + ", " + h);
        var modeList = document.getElementById('modeList');
        for (var i = 0; i < modeList.length; i++) {
            if (modeList.options[i].value == deviceid) {
                if (w == 0 && h == 0 && retry == false) {
                    var id = modeList.options[i].id;
                    var label = getCameraName(videoTracks[0].label);
                    $('#modeList').modePicker("refresh");
                    $('#modeList').splice(i, 1, '<option id="' + id + '" value="' + deviceid + '" data-content="<img src=\'./' + useLanguage + '/images/CAMERA.png\' style=\'width:40px; height:40px;\'>&nbsp;<span style=\'display:inline-block;\'>' + label + '</span>"></option>');
                    $('#modeList').modePicker("refresh");
                    if (list_valid_device.indexOf(modeList.options[i].value + "::" + videoTracks[0].label) < 0) {
                        list_valid_device.push(modeList.options[i].value + "::" + videoTracks[0].label);
                        map_device[videoTracks[0].label.slice(-10, -1)] = modeList.options[i].value;    // VID:PIDを取り出し
                    }
                } else {
                    if (useBrowser == "chrome" || useBrowser == "safari" || useBrowser == "firefox") $('.recording').fadeIn("fast");
                    $(".rotation").fadeIn("fast");
                    $(".freeze").fadeIn("fast");
                    break;
                }
            }
            if (w == 0 && h == 0 && retry == false && modeList.options[i].id.includes(TEXT_MODE_CAMERA) == true && list_valid_device.indexOf(modeList.options[i].value + "::" + videoTracks[0].label) < 0) {
                var is_regged = false;
                list_valid_device.forEach(function(val, index, ar) {
                    var list = val.split("::");
                    if (modeList.options[i].value == list[0]) {
                        is_regged = true;
                    }
                });
                if (is_regged == false && modeList.options[i].value != deviceid) {
                    deviceid = modeList.options[i].value;
                    break;
                }
            }
        }
        localStream = stream;
        if (w == 0 && h == 0 && retry == false) {
            if (camcount - 1 != list_valid_device.length + list_reject_device.length) {
                startVideo(0, 0, false);
                return;
            } else if (camcount - 1 == list_valid_device.length + list_reject_device.length) {
                stopVideo();
                if (USE_LOCAL == false) {
                    is_init_checked = false;
                    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(errorCallback);
                }
                return;
            }
        }
        var background_video = document.querySelector('video');
        $("video").prop('muted', is_enable_audio ? false : true);
        background_video.srcObject = stream;
        background_video.onloadedmetadata = function(e) {
            background_video.play();
        };
/*
        timer_facerocognition = setInterval("facerecognition()", 5000);
*/
    },
    function(err) {
        console.log("The following error occurred: " + err.name + ":" + err.message);
        if (retry == true && resolutions.length > r) {
            startVideo(resolutions[r].width, resolutions[r].height, retry);
            r++;
        } else {
            var modeList = document.getElementById('modeList');
            for (var i = 0; i < modeList.length; i++) {
                if (modeList.options[i].value == deviceid) {
                    modeList.remove(i);
                    $('select[name=selectedMode]').val(MODE.WHITEBOARD1);
        $('#modeList').modePicker("refresh");
                    changeMode();
                    if (retry == true) alert(TEXT_CANNOT_USE_CAMERA);
                    list_reject_device.push(deviceid);
                    break;
                }
            }
        }
    });
}
function stopVideo() {
/*
    clearInterval(timer_facerocognition);
*/
    for (track of localStream.getTracks()) {
        track.stop();
        if (localStream.active) {
            console.log("stop " + track.kind + " : error");
        } else {
            console.log("stop " + track.kind + " : success");
        }
    }
    localStream = null;
    var background_video = document.getElementById('video');
    background_video.pause();
    background_video.src = '';
    background_video.srcObject = null;
}
function getCameraName(label) {
    if (label.includes("(09a1:001f)") || label.includes("MO-1") || label.includes("ELMO UVC Camera")) {
        if (label.includes("MO-1")) {
            label = "MO-1/MO-1w";
        } else {
            label = "ELMO UVC Camera";
        }
    } else if (label.includes("(09a1:0020)") || label.includes("TX-1") || label.includes("LX-1")) {
        label = "TX-1/LX-1";
    } else if (label.includes("(09a1:0026)") || label.includes("MX-P2")) {
        label = "MX-P2";
    } else if (label.includes("(09a1:0030)") || label.includes("MX-P2A")) {
        label = "MX-P2A";
    } else if (label.includes("(09a1:002f)") || label.includes("MX-P3W")) {
        label = "MX-P3W";
    } else if (label.includes("(09a1:002a)") || label.includes("MX-P3")) {
        label = "MX-P3";
    } else if (label.includes("(09a1:0021)") || label.includes("MX-1") || label.includes("MX-P")) {
        label = "MX-1/MX-P";
    } else if (label.includes("(09a1:0022)") || label.includes("doccam-px")) {
        label = "PX-30/PX-10";
    } else if (label.includes("(09a1:0028)") || label.includes("doccam-l12f")) {
        label = "L-12F";
    } else if (label.includes("(09a1:0027)") || label.includes("OX-1")) {
        label = "OX-1";
    } else if (label.includes("(09a1:0025)") || label.includes("MA-1") || label.includes("MO-2")) {
        label = "MA-1/MO-2";
    } else if (label.includes("(09a1:0029)") || label.includes("L-12W")) {
        label = "L-12W";
    } else if (label.includes("(09a1:002c)") || label.includes("L-12G/TT-12G")) {
        label = "L-12G/TT-12G";
    } else if (label.includes("(09a1:0032)") || label.includes("EX-1")) {
        label = "EX-1";
    } else if (label.includes("(09a1:0033)") || label.includes("L-12S/TT-12S")) {
        label = "L-12S/TT-12S";
    } else if (label.includes("(09a1:") || label.includes("ELMO ")) {
        label = "ELMO camera";
    } else if (USE_LOCAL == false) {
		if (useOS == "iOS") {
			// iOSは内蔵カメラ無効
        } else if (label.includes("facing front")) { // android
            label = "Front camera";
        } else if (label.includes("facing back")) {	// android
            label = "Back camera";
        } else if (label.toLowerCase().includes("facetime")) { // Mac
            label = "Front camera";
        } else if (label.toLowerCase().includes("camera front")) { // surface
            label = "Front camera";
        } else if (label.toLowerCase().includes("camera rear")) { // surface
            label = "Back camera";
        } else if (label.toLowerCase().includes("web camera") || label.toLowerCase().includes("webcam")) {
            label = "Web camera";
        } else if (label.includes("Integrated Camera") || label.includes("HP HD Camera")) {
            //label = "Web camera";   // ToshibaとHPの内蔵カメラ
        } else {
            console.log("External camera: " + label);	// uvc camera, hd camera
            if (!label.includes(TEXT_MODE_CAMERA)) {
                //label = label + "*";
            }
        }
    } else if (!label.includes(TEXT_MODE_CAMERA)) {
        label = "Web camera";
    }
    return label;
}
function isDocCam(label) {
    if (label == "MO-1/MO-1w" || label == "TX-1/LX-1" || label.includes("MX-P") || label == "PX-30/PX-10" || label == "L-12F"
		|| label == "OX-1" || label == "L-12G/TT-12G" || label == "EX-1" || label == "L-12S/TT-12S" || label == "ELMO camera") {
        return true;
    }
    return false;
}
function changeModeCamera(id) {
    if (USE_LOCAL == false) {
        deviceid = id;
    } else if (map_device[id] == undefined || camcount - 1 != list_valid_device.length + list_reject_device.length) {
        var background_image = document.getElementById('image');
        background_image.getContext("2d").fillStyle = "white";
        background_image.getContext("2d").fillRect(0, 0, background_image.width, background_image.height);
        $("#background").css('background-color', 'transparent');
        document.getElementById('video').style.display = "none";
        document.getElementById('image').style.display = "block";
        return false;
    } else {
        deviceid = map_device[id];
    }
    if (is_find_audio == false) {
        is_mute = true;
        $(".speaker").attr("src", "./" + useLanguage + "/images/Speaker_off.png");
    }
    changeBackgroundBefore("camera");
    r = 0; startVideo(camera_w, camera_h, true);
    mode_current = deviceid;
    changeBackgroundAfter("camera", false);
    return true;
}
function setResolutionCamera(w, h) {
    camera_w = w;
    camera_h = h;
}
function updateCameraList() {
    list_reject_device = [];
    list_valid_device = [];
    map_device = {};
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(errorCallback);
}
var resolutions = [
    {
        "label": "VGA",
        "width": 640,
        "height": 480,
        "ratio": "4:3"
    },
    {
        "label": "XGA",
        "width": 1024,
        "height": 768,
        "ratio": "4:3"
    },
    {
        "label": "SXGA",
        "width": 1024,
        "height": 768,
        "ratio": "4:3"
    },
    {
        "label": "720p(HD)",
        "width": 1280,
        "height": 720,
        "ratio": "16:9"
    },
    {
        "label": "WXGA",
        "width": 1280,
        "height": 800,
        "ratio": "16:10"
    },
    {
        "label": "SXGA",
        "width": 1280,
        "height": 1024,
        "ratio": "5:4"
    },
    {
        "label": "UXGA",
        "width": 1600,
        "height": 1200,
        "ratio": "4:3"
    },
    {
        "label": "1080p(FHD)",
        "width": 1920,
        "height": 1080,
        "ratio": "16:9"
    },
    {
        "label": "4K(UHD)",
        "width" : 3840,
        "height": 2160,
        "ratio": "16:9"
    }
];

/* ------------------------------------------------------------------------------------------------ */
var isVideoCaptureDownload = false;
var base64ToBlob = function(base64) {
    var base64Data = base64.split(',')[1],
        data = window.atob(base64Data),
        buff = new ArrayBuffer(data.length),
        arr = new Uint8Array(buff),
        blob, i, dataLen;
    for( i = 0, dataLen = data.length; i < dataLen; i++) {
        arr[i] = data.charCodeAt(i);
    }
    blob = new Blob([arr], {type: 'image/png'});
    return blob;
};
function getImageBackground(cvs, image) {
    if (image == null) cvs.pause();
    var canvasAspect = cvs.width / cvs.height;
    var imgAspect = image != null ? image.width / image.height : cvs.videoWidth / cvs.videoHeight;
    var width, height;
    var cvsTmp = document.createElement('canvas');
    var ctxTmp = cvsTmp.getContext('2d');
    cvsTmp.setAttribute('width',cvs.width);
    cvsTmp.setAttribute('height',cvs.height);
    ctxTmp.save();
    ctxTmp.fillStyle = "black";
    ctxTmp.fillRect(0, 0, cvs.width, cvs.height);
    ctxTmp.translate(parseInt(cvs.width / 2), parseInt(cvs.height / 2));
    if (angle_rotation == 180) {
        ctxTmp.rotate(angle_rotation * Math.PI / 180);
    }
    if (imgAspect >= canvasAspect) {
        width = cvs.width;
        height = cvs.width / imgAspect;
    } else {
        height = cvs.height;
        width = cvs.height * imgAspect;
    }
    if (image == null) {
        ctxTmp.drawImage(cvs, 0, 0, cvs.videoWidth, cvs.videoHeight, parseInt(-(width/2)), parseInt(-(height/2)), width, height);
    } else {
        ctxTmp.drawImage(image, 0, 0, image.width, image.height, parseInt(-(width/2)), parseInt(-(height/2)), width, height);
    }
    ctxTmp.restore();
    var img = new Image();
    img.onload = function() { };
    img.src = cvsTmp.toDataURL("image/png");
    imgLiveTmp = img;
    if (image == null && is_freeze == false) cvs.play();
}
function download_image(x, y, width, height) {
    if (background_type == "camera" || background_type == "video") {
        isVideoCaptureDownload = true;
        if (imgLiveTmp == null) {
            getImageBackground(document.getElementById('video'), null);
            setTimeout(function() { download_image(x, y, width, height) }, 100);
            return;
        }
    } else if (background_type == "image") {
        isVideoCaptureDownload = true;
        if (imgLiveTmp == null) {
            getImageBackground(document.getElementById('image'), imgBackgroundTmp);
            setTimeout(function() { download_image(x, y, width, height) }, 100);
            return;
        }
    }
    $('.status').append("<img src='./" + useLanguage + "/images/STATUS_CAP.png' width='90' height='90' id='status_cap' />");
    var cvsDownload = document.createElement('canvas');
    var ctxDownload = cvsDownload.getContext('2d');
    if (width == 0 || height == 0) {
        width = cvs.width;
        height = cvs.height;
    }
    cvsDownload.setAttribute('width',width);
    cvsDownload.setAttribute('height',height);
    ctxDownload.save();
/*
    if (scale_zoom != 1.0) {
        html2canvas($("#background"), {
            onrendered: function (canvas_b) {
                html2canvas($("#draw"), {
                    onrendered: function (canvas_d) {
                        ctxDownload.drawImage(canvas_b, 0, 0, width, height);
                        ctxDownload.drawImage(canvas_d, 0, 0, width, height);
                        ctxDownload.restore();
                        var blob = base64ToBlob(cvsDownload.toDataURL("image/png"));
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL( blob );
                        link.download = "IMAG" + y + mm + dd + hh + mmi + ss + ".png";
                        link.click();
                    }
                });
            }
        });
    } else
*/
        if (isVideoCaptureDownload == true && imgLiveTmp != null) {
            ctxDownload.drawImage(imgLiveTmp, x, y, width, height, 0, 0, width, height);
        } else {
            ctxDownload.fillStyle = "rgb(255, 255, 255)";
            ctxDownload.fillRect(0, 0, width, height);
        }
        var background_line = document.getElementById('line');
        ctxDownload.drawImage(background_line, x, y, width, height, 0, 0, width, height);
        ctxDownload.restore();
        var blob = base64ToBlob(cvsDownload.toDataURL());
        if (AuthUI.data.authed == true && pickerApiLoaded && oauthToken) {
            gapi.client.load('drive', 'v2', function () {
                insertFile('image/png', "IMAG" + getCurrentDateTime() + ".png", cvsDownload.toDataURL());
            });
        } else {
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL( blob );
            link.download = "IMAG" + getCurrentDateTime() + ".png";
            link.click();
        }
/*
    }
*/
    if (isVideoCaptureDownload == true) {
        imgLiveTmp = null;
        setTimeout(function() { canvas_resize(); }, 1000);
    }
    setTimeout(function() { $('#status_cap').remove(); }, timeout_status);
}
function selectAreaCapture() {
    if (background_type == "camera" || background_type == "video") freeze();
    selectItemType(ITEM_TYPE.RECT_SELECT);
}
function getCurrentDateTime() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var h = now.getHours();
    var mi = now.getMinutes();
    var s = now.getSeconds();
    var mm = ('0' + m).slice(-2);
    var dd = ('0' + d).slice(-2);
    var hh = ('0' + h).slice(-2);
    var mmi = ('0' + mi).slice(-2);
    var ss = ('0' + s).slice(-2);
    var res = y + mm + dd + hh + mmi + ss;
    return res;
}
function insertFile(contentType, fileName, content, callback) {
    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    var metadata = {
            'title': fileName,
            'mimeType': contentType
    };
    var multipartRequestBody = delimiter +
            'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' + content.split(',')[1] + close_delim;
    var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {
                'uploadType': 'multipart'
             },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
    });
    if (!callback) {
      callback = function (file) {
          console.log(file)
      };
    }
    request.execute(callback);
}

/* ------------------------------------------------------------------------------------------------ */
var start_rec = false;
var cnt_rec = 0;
/*
function createContext() {
    var cvsTmp = document.createElement('canvas');
    var ctxTmp = cvsTmp.getContext('2d');
    cvsTmp.setAttribute('width',cvs.width);
    cvsTmp.setAttribute('height',cvs.height);
    ctxTmp.save();
    ctxTmp.fillStyle = "rgb(0, 0, 0)";
    ctxTmp.fillRect(0, 0, cvs.width, cvs.height);
    ctxTmp.drawImage(can, 0, 0, cvs.width, cvs.height);
    ctxTmp.restore();
    return ctxTmp;
}
function nextFrame() {
    if (start_rec == true) {
        cnt_rec++;
        if (cnt_rec == 6) {
            cnt_rec = 0;
            var context = createContext();
            recorder.add(context);
        }
        requestAnimationFrame(nextFrame);
    }
}
*/
function startRecording() {
    if (localStream != null) {
        recorder = new MediaRecorder(localStream);
        recorder.ondataavailable = function(evt) {
        };
        recorder.start();
        $('.status').append("<img src='./" + useLanguage + "/images/STATUS_REC.png' width='90' height='90' id='status_rec' />");
    } else {
/*
        recorder = new Whammy.Video(10);
        start_rec = true;
        cnt_rec = 0;
        var context = createContext();
        recorder.add(context);
        requestAnimationFrame(nextFrame);
*/
        return;
    }
    is_recording = true;
    $(".recording").attr('src', './' + useLanguage + '/images/Rec_S.png');
}
function stopRecording() {
    if (localStream != null) {
        recorder.stop();
        download_video();
        $('#status_rec').remove();
    } else {
/*
        start_rec = false;
        var output = recorder.compile();
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL( output );
        link.download = "MOV_" + getCurrentDateTime() + ".webm";
        link.click();
*/
        return;
    }
    is_recording = false;
    $(".recording").attr('src', './' + useLanguage + '/images/Rec_N.png');
}
function download_video() {
    recorder.ondataavailable = function(e) {
        var blob = new Blob([e.data], { type: e.data.type });
        blobUrl = window.URL.createObjectURL(blob);
        if (AuthUI.data.authed == true && pickerApiLoaded && oauthToken) {
            gapi.client.load('drive', 'v2', function () {
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function() {
                    insertFile('video/webm', "MOV_" + getCurrentDateTime() + ".webm", reader.result);
                };
            });
        } else {
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL( blob );
            link.download = "MOV_" + getCurrentDateTime() + ".webm";
            link.click();
        }
    };
}

/* ------------------------------------------------------------------------------------------------ */
function freeze() {
    var background_video = document.getElementById('video');
    if (is_freeze == false) {
        $(".freeze").attr('src', './' + useLanguage + '/images/Freeze_S.png');
        is_freeze = true;
        background_video.pause();
        var canvasAspect = cvs.width / cvs.height,
        imgAspect = background_video.videoWidth / background_video.videoHeight,
        width, height;
        if (imgAspect >= canvasAspect) {
            width = cvs.width;
            height = cvs.width / imgAspect;
        } else {
            height = cvs.height;
            width = cvs.height * imgAspect;
        }
        background_width = width;
        background_height = height;
        $('.status').append("<img src='./" + useLanguage + "/images/STATUS_FREEZE.png' width='90' height='90' id='status_freeze' />");
    } else if (is_freeze == true) {
        $(".freeze").attr('src', './' + useLanguage + '/images/Freeze_N.png');
        is_freeze = false;
        background_video.play();
        $('#status_freeze').remove();
    }
    adjustPosZoom();
}

/* ------------------------------------------------------------------------------------------------ */
function rotation(draw) {
    if (angle_rotation == 0) {
        $(".rotation").attr('src', './' + useLanguage + '/images/Rotation_S.png');
        angle_rotation = 180;
    } else {
        $(".rotation").attr('src', './' + useLanguage + '/images/Rotation_N.png');
        angle_rotation = 0;
    }
    document.getElementById('image').style.transform = "scale(" + scale_zoom + ") rotate(" + angle_rotation + "deg)";
    document.getElementById('video').style.transform = "scale(" + scale_zoom + ") rotate(" + angle_rotation + "deg)";
    if (draw == true) {
        if (background_type == "whiteboard1") {
            drawBackground(imgDefaultTmp1);
        } else if (background_type == "whiteboard2") {
            drawBackground(imgDefaultTmp2);
        } else if (background_type == "whiteboard3") {
            drawBackground(imgDefaultTmp3);
        } else if (background_type == "whiteboard4") {
            drawBackground(imgDefaultTmp4);
        } else if (background_type == "image") {
            drawBackground(imgBackgroundTmp);
        }
    }
    adjustPosZoom();
}

/* ------------------------------------------------------------------------------------------------ */
function insertimage(path) {
    selectItemType(ITEM_TYPE.IMAGE);
    if (path == "") {
        setTimeout(function(){ $(selectInsertImage).click(); }, 200);
    } else {
        imgInsertPath = path;
    }
}

/* ------------------------------------------------------------------------------------------------ */
var timercount = 0;
var is_show_timer = false;
var id_timeout_timer = 0;
var id_timeout_timeup = 0;
var saved_timercount = 0;
var is_timer_stop = false;
var timer_interval = 1000;
var is_timer_init = true;
function settimer() {
    if (is_show_timer == false) {
        is_show_timer = true;
        if (saved_timercount == 0) {
            if (timer_interval == 1000) document.getElementById("text").innerHTML = "00:00";
        } else {
            timercount = saved_timercount;
            document.getElementById("text").innerHTML =  getTimerString();
        }
        if (is_timer_init == true) {
            is_timer_init = false;
        }
        document.getElementById("text").style.backgroundColor  = 'rgba(0, 0, 0, 0.8)';
        // Do not rely on jQuery's fadeIn here: Bootstrap 5 gives [hidden]
        // display:none!important. The dedicated class has a stronger rule.
        $("#frontmost").removeAttr('hidden').addClass('timer-overlay-visible')
            .stop(true, true).css('opacity', 1).show();
        resizeTimerText();
        $(".timersetting").removeAttr('hidden').stop(true, true).css('opacity', 1).show();
    } else {
        is_show_timer = false;
        $(".timersetting").stop(true, true).hide();
        $("#frontmost").removeClass('timer-overlay-visible').stop(true, true).hide();
        document.getElementById("text").innerHTML = "";
        stoptimer();
        timercount = saved_timercount;
        finishedtimer();
    }
}
function updatetimer() {
    timercount -= timer_interval;
    if (timercount < 0) return;
    document.getElementById("text").innerHTML =  getTimerString();
    if (timercount <= 0) {
       var audio = document.getElementById('timersound');
        audio.play();
        document.getElementById("text").style.backgroundColor  = 'rgba(255, 0, 0, 0.8)';
        $("#timersetting_startstop").attr("src", "./" + useLanguage + "/images/Timer_startstop.png");
        id_timeout_timer = 0;
    } else {
        if (timercount < 10 * 1000) {
            document.getElementById("text").style.backgroundColor  = 'rgba(255, 128, 0, 0.8)';
        } else {
            document.getElementById("text").style.backgroundColor  = 'rgba(0, 0, 0, 0.8)';
        }
        id_timeout_timer = setTimeout(function(){ updatetimer(); }, timer_interval);
    }
}
function starttimer() {
    if (timer_set != "") finishedtimer();
    if (timercount == 0 && saved_timercount != 0) {
        timercount = saved_timercount;
        document.getElementById("text").innerHTML =  getTimerString();
        document.getElementById("text").style.backgroundColor  = 'rgba(0, 0, 0, 0.8)';
    }
    if (id_timeout_timer != 0 || timercount == 0) return;
    if (timercount > 0 && is_timer_stop == false) saved_timercount = timercount;
    is_timer_stop = false;
    $("#timersetting_startstop").attr("src", "./" + useLanguage + "/images/Timer_startstop_S.png");
    id_timeout_timer = setTimeout(function(){ updatetimer(); }, timer_interval);
}
function stoptimer() {
    if (timer_set != "") finishedtimer();
    if (id_timeout_timer == 0) return;
    clearTimeout(id_timeout_timer);
    is_timer_stop = true;
    finishedtimer();
    $("#timersetting_startstop").attr("src", "./" + useLanguage + "/images/Timer_startstop.png");
}
function resettimer() {
    if (id_timeout_timer != 0) clearTimeout(id_timeout_timer);
    is_timer_stop = false;
    finishedtimer();
    saved_timercount = 0; timercount = 0;
    if (timer_interval == 1000) document.getElementById("text").innerHTML = "00:00";
    document.getElementById("text").style.backgroundColor  = 'rgba(0, 0, 0, 0.8)';
    $("#timersetting_startstop").attr("src", "./" + useLanguage + "/images/Timer_startstop.png");
}
function addtimercount(time_old, time) {
    if (saved_timercount == timercount) {
        if ((timercount == 5 * 60 * 1000 && timercount < 95 * 60 * 1000) || (timercount == 3 * 60 * 1000 && timercount < 97 * 60 * 1000) || (timercount == 1 * 60 * 1000 && timercount < 99 * 60 * 1000)) {
            saved_timercount = 0; timercount = 0;
        }
    }
    if (Number.isNaN(time) ||timercount - time_old + time < 0) return;
    if (timer_interval == 10 && 99 * 60 * 1000 + 59 * 1000 + 99 < timercount - (Number.isNaN(time_old) ? 0 : time_old) + time) { finishedtimer(); return; }
    if (timer_interval == 1000 && 99 * 60 * 1000 + 59 * 1000 < timercount - (Number.isNaN(time_old) ? 0 : time_old) + time) { finishedtimer(); return; }
    if (Number.isNaN(time_old) == false) {
        timercount -= time_old;
    }
    timercount += time;
    document.getElementById("text").innerHTML =  getTimerString();
    document.getElementById("text").style.backgroundColor  = 'rgba(0, 0, 0, 0.8)';
}
function getTimerString() {
    var current = "";
    var m = Math.floor((timercount / 1000) / 60);
    var s = Math.floor((timercount - m * 1000 * 60) / 1000);
    if (timer_interval == 10) {
        var z = Math.floor((timercount - m * 1000 * 60 - s * 1000) / 10);
        current = ('00' + m.toString()).slice(-2) + ":" + ('00' + s.toString()).slice(-2) + "." + ('00' + z.toString()).slice(-2);
    }
    if (timer_interval == 1000) {
        current = ('00' + m.toString()).slice(-2) + ":" + ('00' + s.toString()).slice(-2);
    }
    return current;
}
function finishedtimer() {
    document.getElementById("text").innerHTML =  getTimerString();
    document.getElementById("text").style.backgroundColor  = 'rgba(0, 0, 0, 0.8)';
    id_timeout_timer = 0;
    timer_set = "";
    timer_set_min = "";
    timer_set_sec = "";
}

/* ------------------------------------------------------------------------------------------------ */
var item_type_tmp = ITEM_TYPE.LINE_FREE_PEN;
function changeZoom () {
    adjustPosZoom();
    scale_zoom = $("input[type=range]").val();
    zoom();
    if (scale_zoom != 1.0) {
        hideSettingPen();
        hideSettingMarker();
        hideSettingEraser();
        $('.pencil').fadeOut("fast");
        $('.marker').fadeOut("fast");
        $('.clearObject').fadeOut("fast");
        $('.selectitem').fadeIn("fast");
    } else {
        $('.pencil').fadeIn("fast");
        $('.marker').fadeIn("fast");
        $('.clearObject').fadeIn("fast");
        $('.selectitem').fadeOut("fast");
    }
}
function zoom() {
    if (background_type == "camera" || background_type == "video") {
        document.getElementById('video').style.transform = "scale(" + scale_zoom + ") rotate(" + angle_rotation + "deg)";
        if (scale_zoom != 1.0 && item_type != ITEM_TYPE.ZOOM) {
            item_type_tmp = item_type;
            selectItemType(ITEM_TYPE.ZOOM);
        } else if (scale_zoom != 1.0 && item_type == ITEM_TYPE.ZOOM) {
            selectItemType(ITEM_TYPE.ZOOM);
        } else {
            clearTimeout(id_timeout_setitemtype);
            id_timeout_setitemtype = setTimeout(function(){ selectItemType(item_type_tmp) }, 200);
        }
        document.getElementById('line').style.transform = "scale(" + scale_zoom + ")";
        document.getElementById('canvas').style.transform = "scale(" + scale_zoom + ")";
    } else {
        document.getElementById('image').style.transform = "scale(" + scale_zoom + ") rotate(" + angle_rotation + "deg)";
        if (scale_zoom != 1.0 && item_type != ITEM_TYPE.ZOOM) {
            item_type_tmp = item_type;
            selectItemType(ITEM_TYPE.ZOOM);
        } else if (scale_zoom != 1.0 && item_type == ITEM_TYPE.ZOOM) {
            selectItemType(ITEM_TYPE.ZOOM);
        } else {
            clearTimeout(id_timeout_setitemtype);
            id_timeout_setitemtype = setTimeout(function(){ selectItemType(item_type_tmp) }, 200);
        }
        document.getElementById('line').style.transform = "scale(" + scale_zoom + ")";
        document.getElementById('canvas').style.transform = "scale(" + scale_zoom + ")";
    }
}
function adjustPosZoom () {
    if (background_type == "camera" || background_type == "video") {
        var background_video = document.querySelector('video');
        var canvasAspect = cvs.width / cvs.height,
        imgAspect = background_video.videoWidth / background_video.videoHeight,
        width, height;
        if (imgAspect >= canvasAspect) {
            width = cvs.width;
            height = cvs.width / imgAspect;
        } else {
            height = cvs.height;
            width = cvs.height * imgAspect;
        }
        background_width = width;
        background_height = height;
        rangeX = Math.ceil((background_width * $("input[type=range]").val() - cvs.width) / 2);
        rangeY = Math.ceil((background_height * $("input[type=range]").val() - cvs.height) / 2);
        moveX = Math.ceil((moveX * $("input[type=range]").val()) / scale_zoom);
        moveY = Math.ceil((moveY * $("input[type=range]").val()) / scale_zoom);
        if (-1 * rangeX > moveX) moveX = -1 * rangeX;
        if (rangeX < moveX) moveX = rangeX;
        if (-1 * rangeY > moveY) moveY = -1 * rangeY;
        if (rangeY < moveY) moveY = rangeY;
        if ($("input[type=range]").val() != 1.0) {
            if (-1 * rangeX <= moveX && rangeX >= moveX) {
                $('#image').css('margin-left', moveX + 'px');
                $('#video').css('margin-left', moveX + 'px');
                $('#line').css('margin-left', moveX + 'px');
                $('#canvas').css('margin-left', moveX + 'px');
            } else {
                $('#image').css('margin-left', '0px');
                $('#video').css('margin-left', '0px');
                $('#line').css('margin-left', '0px');
                $('#canvas').css('margin-left', '0px');
            }
            if (-1 * rangeY <= moveY && rangeY >= moveY) {
                $('#image').css('margin-top', moveY + 'px');
                $('#video').css('margin-top', moveY + 'px');
                $('#line').css('margin-top', moveY + 'px');
                $('#canvas').css('margin-top', moveY + 'px');
            } else {
                $('#image').css('margin-top', '0px');
                $('#video').css('margin-top', '0px');
                $('#line').css('margin-top', '0px');
                $('#canvas').css('margin-top', '0px');
            }
        } else {
            moveX = 0; moveY = 0;
            $('#image').css('margin-left', '0px');
            $('#image').css('margin-top', '0px');
            $('#video').css('margin-left', '0px');
            $('#video').css('margin-top', '0px');
            $('#line').css('margin-left', '0px');
            $('#line').css('margin-top', '0px');
            $('#canvas').css('margin-left', '0px');
            $('#canvas').css('margin-top', '0px');
        }
    } else {
        rangeX = Math.ceil((background_width * $("input[type=range]").val() - cvs.width) / 2);
        rangeY = Math.ceil((background_height * $("input[type=range]").val() - cvs.height) / 2);
        moveX = Math.ceil((moveX * $("input[type=range]").val()) / scale_zoom);
        moveY = Math.ceil((moveY * $("input[type=range]").val()) / scale_zoom);
        if (-1 * rangeX > moveX) moveX = -1 * rangeX;
        if (rangeX < moveX) moveX = rangeX;
        if (-1 * rangeY > moveY) moveY = -1 * rangeY;
        if (rangeY < moveY) moveY = rangeY;
        if ($("input[type=range]").val() != 1.0) {
            if (-1 * rangeX <= moveX && rangeX >= moveX) {
                $('#image').css('margin-left', moveX + 'px');
                $('#line').css('margin-left', moveX + 'px');
                $('#canvas').css('margin-left', moveX + 'px');
            } else {
                $('#image').css('margin-left', '0px');
                $('#line').css('margin-left', '0px');
                $('#canvas').css('margin-left', '0px');
            }
            if (-1 * rangeY <= moveY && rangeY >= moveY) {
                $('#image').css('margin-top', moveY + 'px');
                $('#line').css('margin-top', moveY + 'px');
                $('#canvas').css('margin-top', moveY + 'px');
            } else {
                $('#image').css('margin-top', '0px');
                $('#line').css('margin-top', '0px');
                $('#canvas').css('margin-top', '0px');
            }
        } else {
            moveX = 0; moveY = 0;
            $('#image').css('margin-left', '0px');
            $('#image').css('margin-top', '0px');
            $('#line').css('margin-left', '0px');
            $('#line').css('margin-top', '0px');
            $('#canvas').css('margin-left', '0px');
            $('#canvas').css('margin-top', '0px');
        }
    }
}

/* ------------------------------------------------------------------------------------------------ */
function selectItemType(type) {
    if (type.includes(ITEM_TYPE.LINE_FREE_PEN)) {
        changePenIcon("S");
        changeMarkerIcon("N");
        $(".clearObject").attr('src', './' + useLanguage + '/images/Eraser_part_N.png');
        $(".selectitem").attr('src', './' + useLanguage + '/images/Hand_N.png');
    } else if (type.includes(ITEM_TYPE.LINE_FREE_MARKER)) {
        changePenIcon("N");
        changeMarkerIcon("S");
        $(".clearObject").attr('src', './' + useLanguage + '/images/Eraser_part_N.png');
        $(".selectitem").attr('src', './' + useLanguage + '/images/Hand_N.png');
    } else if (type == ITEM_TYPE.ERASER) {
        changePenIcon("N");
        changeMarkerIcon("N");
        $(".clearObject").attr('src', './' + useLanguage + '/images/Eraser_part_S.png');
        $(".selectitem").attr('src', './' + useLanguage + '/images/Hand_N.png');
    } else if (type == ITEM_TYPE.SELECT || type == ITEM_TYPE.ZOOM) {
        changePenIcon("N");
        changeMarkerIcon("N");
        $(".clearObject").attr('src', './' + useLanguage + '/images/Eraser_part_N.png');
        $(".selectitem").attr('src', './' + useLanguage + '/images/Hand_S.png');
    }
    if (background_type == "material") {
        if (type == ITEM_TYPE.SELECT || type == ITEM_TYPE.ZOOM) {
            $(".timersetting").stop(true, true).fadeOut("fast", function() {});
            $(".timer").stop(true, true).fadeOut("fast", function() {});
        } else {
            $(".timer").stop(true, true).fadeIn(100, function() {
                if (is_show_timer == true) {
                    $(".timersetting").stop(true, true).fadeIn(100, function() {});
                }
            });
        }
    }
    item_type = type;
}
function changePenIcon(state) {
    if (color_pen.slice(0,-4) == "rgba(0,0,0,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_Black_' + state + '.png');
    } else if (color_pen.slice(0,-4) == "rgba(255,0,0,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_Red_' + state + '.png');
    } else if (color_pen.slice(0,-4) == "rgba(0,255,0,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_Green_' + state + '.png');
    } else if (color_pen.slice(0,-4) == "rgba(0,0,255,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_Blue_' + state + '.png');
    } else if (color_pen.slice(0,-4) == "rgba(255,255,0,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_Yellow_' + state + '.png');
    } else if (color_pen.slice(0,-4) == "rgba(255,0,255,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_Magenta_' + state + '.png');
    } else if (color_pen.slice(0,-4) == "rgba(0,255,255,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_Cyan_' + state + '.png');
    } else if (color_pen.slice(0,-4) == "rgba(255,255,255,") {
        $(".pencil").attr('src', './' + useLanguage + '/images/PEN_White_' + state + '.png');
    }
}
function changeMarkerIcon(state) {
    if (color_marker.slice(0,-4) == "rgba(0,0,0,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_Black_' + state + '.png');
    } else if (color_marker.slice(0,-4) == "rgba(255,0,0,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_Red_' + state + '.png');
    } else if (color_marker.slice(0,-4) == "rgba(0,255,0,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_Green_' + state + '.png');
    } else if (color_marker.slice(0,-4) == "rgba(0,0,255,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_Blue_' + state + '.png');
    } else if (color_marker.slice(0,-4) == "rgba(255,255,0,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_Yellow_' + state + '.png');
    } else if (color_marker.slice(0,-4) == "rgba(255,0,255,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_Magenta_' + state + '.png');
    } else if (color_marker.slice(0,-4) == "rgba(0,255,255,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_Cyan_' + state + '.png');
    } else if (color_marker.slice(0,-4) == "rgba(255,255,255,") {
        $(".marker").attr('src', './' + useLanguage + '/images/MARKER_White_' + state + '.png');
    }
}
