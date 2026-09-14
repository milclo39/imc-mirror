var language = (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage;
var useLanguage = "J"; //現状は言語によってcss/jsの違いは無いため固定
/*
if (language == "ja") {
    useLanguage = "J";
} else if (language == "fr") {
    useLanguage = "F";
} else if (language == "de") {
    useLanguage = "D";
} else {
    useLanguage = "E";
}
*/
$("#icon").attr('href', './' + useLanguage + '/images/icon.ico');
$("#css").attr('href', './' + useLanguage + '/css/Main.css');
$("#pen_black").attr('src', './' + useLanguage + '/images/SET_color_BLACK_S.png');
$("#pen_red").attr('src', './' + useLanguage + '/images/SET_color_RED_P.png');
$("#pen_green").attr('src', './' + useLanguage + '/images/SET_color_GREEN_P.png');
$("#pen_blue").attr('src', './' + useLanguage + '/images/SET_color_BLUE_P.png');
$("#pen_yellow").attr('src', './' + useLanguage + '/images/SET_color_YELLOW_P.png');
$("#pen_magenta").attr('src', './' + useLanguage + '/images/SET_color_MAGENTA_P.png');
$("#pen_cyan").attr('src', './' + useLanguage + '/images/SET_color_CYAN_P.png');
$("#pen_white").attr('src', './' + useLanguage + '/images/SET_color_WHITE_P.png');
$("#pen_width_1").attr('src', './' + useLanguage + '/images/SET_line1_S.png');
$("#pen_width_2").attr('src', './' + useLanguage + '/images/SET_line2_P.png');
/*
$("#pen_width_3").attr('src', './' + useLanguage + '/images/SET_line3_P.png');
*/
$("#marker_black").attr('src', './' + useLanguage + '/images/SET_color_BLACK_P.png');
$("#marker_red").attr('src', './' + useLanguage + '/images/SET_color_RED_P.png');
$("#marker_green").attr('src', './' + useLanguage + '/images/SET_color_GREEN_P.png');
$("#marker_blue").attr('src', './' + useLanguage + '/images/SET_color_BLUE_P.png');
$("#marker_yellow").attr('src', './' + useLanguage + '/images/SET_color_YELLOW_S.png');
$("#marker_magenta").attr('src', './' + useLanguage + '/images/SET_color_MAGENTA_P.png');
$("#marker_cyan").attr('src', './' + useLanguage + '/images/SET_color_CYAN_P.png');
$("#marker_white").attr('src', './' + useLanguage + '/images/SET_color_WHITE_P.png');
$("#marker_width_1").attr('src', './' + useLanguage + '/images/SET_line1_P.png');
$("#marker_width_2").attr('src', './' + useLanguage + '/images/SET_line2_P.png');
/*
$("#marker_width_3").attr('src', './' + useLanguage + '/images/SET_line3_P.png');
$("#marker_opacity_8").attr('src', './' + useLanguage + '/images/SET_PEN_P.png');
$("#marker_opacity_5").attr('src', './' + useLanguage + '/images/SET_MARKER_P.png');
*/
$(".clearAll").attr('src', './' + useLanguage + '/images/Eraser_all_P.png');
$("#menubackground").attr('src', './' + useLanguage + '/images/MenuBackground.png');
$(".menudown").attr('src', './' + useLanguage + '/images/Close_L_S.png');
$(".pencil").attr('src', './' + useLanguage + '/images/PEN_Black_S.png');
$(".marker").attr('src', './' + useLanguage + '/images/MARKER_Yellow_N.png');
$(".clearObject").attr('src', './' + useLanguage + '/images/Eraser_part_N.png');
$(".selectitem").attr('src', './' + useLanguage + '/images/Hand_N.png');
$(".captureall").attr('src', './' + useLanguage + '/images/Capture_N.png');
$(".recording").attr('src', './' + useLanguage + '/images/Rec_N.png');
$(".rotation").attr('src', './' + useLanguage + '/images/Rotation_N.png');
$(".freeze").attr('src', './' + useLanguage + '/images/Freeze_N.png');
$(".speaker").attr('src', './' + useLanguage + '/images/Speaker_off.png');
$(".fullscreen").attr('src', './' + useLanguage + '/images/FullScreen.png');
$("#help").attr('href', './' + useLanguage + '/Manual/Manual.html');
$(".help").attr('src', './' + useLanguage + '/images/Help_maru.png');
$(".logo").attr('src', './' + useLanguage + '/images/CalibrationPlus.png');
$(".positionchange").attr('src', './' + useLanguage + '/images/Move_R_S.png');
$(".menuup").attr('src', './' + useLanguage + '/images/MENU_UP.png');
$("#timer").attr('src', './' + useLanguage + '/images/Timer.png');
/*
$("#login").attr('src', './' + useLanguage + '/images/Login.png');
*/
$("#timersetting_startstop").attr('src', './' + useLanguage + '/images/Timer_startstop.png');
$("#timersetting_reset").attr('src', './' + useLanguage + '/images/Timer_reset.png');
$("#timersetting_1min").attr('src', './' + useLanguage + '/images/Timer_1min.png');
$("#timersetting_3min").attr('src', './' + useLanguage + '/images/Timer_3min.png');
$("#timersetting_5min").attr('src', './' + useLanguage + '/images/Timer_5min.png');
/*
if (language == "ja") {
    $(".auth").attr('src', './' + useLanguage + '/images/Auth.png');
} else {
    $(".auth").attr('src', './' + useLanguage + '/images/Auth_E.png');
}
*/
document.querySelector("#timersound source").src = './' + useLanguage + '/sounds/timer.mp3';
document.querySelector("#timersound").load();
document.write("<script type=\'text/javascript\' src=\'./" + useLanguage + "/js/Firebase.js\'><\/script>");
/*
document.write("<script type=\'text/javascript\' src=\'./" + useLanguage + "/js/Draw.js\'><\/script>");
*/
document.write("<script type=\'text/javascript\' src=\'./" + useLanguage + "/js/Text.js\'><\/script>");
document.write("<script type=\'text/javascript\' src=\'./" + useLanguage + "/js/Main.js\'><\/script>");
