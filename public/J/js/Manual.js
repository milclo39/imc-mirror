var VERSION = "1.9 Mirror";
var language = (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage;
if (language.includes("ja")) {
    document.documentElement.lang = "jp";
    var IM_TITLE = "Image Mate + C";
    var COMMON_BUTTON_FEATURE = "特徴";
    var COMMON_BUTTON_FUNCTION = "機能";
    var COMMON_BUTTON_SUPPOTED  = "動作環境";
    var COMMON_BUTTON_DISCLAMER  = "サイトのご利用について";
    var COMMON_BUTTON_TRADEMARK  = "商標";
    var COMMON_CHECK_VISIBLE = "今後表示しない";

    var FEATURE_BUTTON_WHITEBOARD = "ホワイトボード";
    var FEATURE_BUTTON_CONTENTS = "コンテンツ";
    var FEATURE_BUTTON_CAMERA = "カメラ";
/*
    var FEATURE_BUTTON_DRIVE = "アップロード";
*/
    var DESCRIPTION_FEATURE = "映したい背景をリストから選択するだけで様々な用途に対応できます。余計な設定などはいりません!" + "<br><br>";
    var DESCRIPTION_FEATURE2_WHITE_BOARD = "画面に様々なものを記入し、これを保存することができます。"
        + "<br>" + "保存した画像は、コンテンツリストから選択して開くことができます。";
    var DESCRIPTION_FEATURE2_CONTENTS = "本Webアプリからダウンロードした画像や動画ファイルを再生することができます。"
        + "<br>" + "表示されたコンテンツ上にペンで記入することができ、画像を保存することもできます。";
    var DESCRIPTION_FEATURE2_CAMERA = "書画カメラをPCにつなげれば、リストに書画カメラのアイコンが表示されます。"
        + "<br>" + "これをクリックするだけでカメラ映像が表示され、これを録画することもできます。";
/*
    var DESCRIPTION_FEATURE2_DRIVE = "ログインしてキャプチャ/録画をすることでファイルをアップロードします。"
        + "<br>" + "リストから Google ドライブ?? を選択することでアップロードしたファイルを背景に設定できます。";
*/
    var DESCRIPTION_ATTENTION = "リストにアイコンが表示されない場合、画面を更新してください";
    var DESCRIPTION_ATTENTION2 = "対応するコンテンツは静止画(png/jpg/bmp)と動画(webm/mp4)です。";
    var DESCRIPTION_ATTENTION3 = "ホワイトボードは４つ保持しますが、保存は個別に行ってください。";
    var DESCRIPTION_FEATURE_SUBTITLE = "簡単セットアップ!";
    var DESCRIPTION_FEATURE_USECASE_WHITEBOARD = "<b>" + "■ 利用方法(ホワイトボード)" + "</b>";
    var DESCRIPTION_FEATURE_USECASE_CONTENTS = "<b>" + "■ 利用方法(コンテンツ)" + "</b>";
    var DESCRIPTION_FEATURE_USECASE_CAMERA = "<b>" + "■ 利用方法(カメラ)" + "</b>";
/*
    var DESCRIPTION_FEATURE_USECASE_DRIVE = "<b>" + "■ 利用方法(アップロード)" + "</b>";
*/
    var FUNCTION_BUTTON_ICON = "アイコン";
    var FUNCTION_BUTTON_OTHERS = "その他";
    var FUNCTION_SUBTITLE = "機能説明";
    var FUNCTION_ATTENTION_TEXT = "注意事項";

    var DESCRIPTION_TITLE_PEN = "ペン機能";
    var DESCRIPTION_FUNCTION_PEN = "画面上にペンで記入することができます。" + "<br>" + "8色のカラーからお好みに合わせて選択することができます。";
    var DESCRIPTION_FUNCTION_PEN_ATTENTION =['ZOOMバーで拡大中はペンで記入することはできません。'
                                             , 'UVC 動画再生中にペンで記入する様子を録画しても、録画データにペンで記入した内容は反映されません。'
                                             ,'フリーズ回転機能は、ペンで記入したオブジェクトに対しては反映されません。'];

    var DESCRIPTION_TITLE_MARKER = "マーカー機能";
    var DESCRIPTION_FUNCTION_MARKER = "画面上にマーカーで記入することができます。ペンで書いたオブジェクトに対して、透過して書くことができます。" + "<br>" + "8色のカラーからお好みに合わせて選択することができます。";
    var DESCRIPTION_FUNCTION_MARKER_ATTENTION =["ZOOMバーで拡大中はマーカーで記入することはできません。"
                                                , "UVC 動画再生中にペンで記入する様子を録画しても、録画データにマーカーで記入した内容は反映されません。"
                                                , "フリーズ回転機能は、マーカーで記入したオブジェクトに対しては反映されません。"];

    var DESCRIPTION_TITLE_ERASER = "消しゴム機能";
    var DESCRIPTION_FUNCTION_ERASER = "ペンで書いたものを消すことができます。";
    var DESCRIPTION_FUNCTION_ERASER_ATTENTION = ["ZOOMバー拡大中は、ペンで記入したオブジェクトを削除することはできません。"
        , "一度消したものを元に戻すことはできません。"];

    var DESCRIPTION_TITLE_HAND = "選択機能";
    var DESCRIPTION_FUNCTION_HAND = "ペンで書いたものを選択することができます。";
    var DESCRIPTION_FUNCTION_HAND_ATTENTION = ["アップロードしたファイルを背景にしたときは、線を選択できません。(代わりに、背景を移動します。)"];

    var DESCRIPTION_TITLE_STILL = "キャプチャー機能";
    var DESCRIPTION_FUNCTION_STILL = "画面をキャプチャすることができます。"; 
    var DESCRIPTION_FUNCTION_STILL_ATTENTION = ["ZOOMした時に撮影しても、1倍率の画が撮影されます。"];

    var DESCRIPTION_TITLE_RECORD = "録画機能";
    var DESCRIPTION_FUNCTION_RECORD = "録画することができます。" + "<br>" + "録画した動画ファイル(webmファイル)はコンテンツから選択することで再生できます。" + "<br>" + "Chrome™ ブラウザやVLCメディアプレイヤーでも再生することができます。";
    var DESCRIPTION_FUNCTION_RECORD_ATTENTION = ["ペンで書いたオブジェクトは録画されません。"
        , "ZOOMした時に録画しても、1倍率の画が撮影されます。"
        , "録画中に回転機能を利用しても、その機能は反映されません。"
        , "録画中にフリーズ機能を利用しても、その機能は反映されません。"];

    var DESCRIPTION_TITLE_FREEZE = "フリーズ機能";
    var DESCRIPTION_FUNCTION_FREEZE = "背景動画をフリーズさせることができます。背景をUVCカメラ、動画再生にした時だけアイコンが表示されます。"; 
    var DESCRIPTION_FUNCTION_FREEZE_ATTENTION = "";

    var DESCRIPTION_TITLE_ROTATION = "回転機能";
    var DESCRIPTION_FUNCTION_ROTATION = "背景を回転させることができます。ホワイトボード以外を選択した時にアイコンが表示され、使用することができます。"; 
    var DESCRIPTION_FUNCTION_ROTATION_ATTENTION = ["回転機能は、ペンで記入したオブジェクトには適応されません。"]

    var DESCRIPTION_TITLE_ZOOM = "ズーム";
    var DESCRIPTION_FUNCTION_ZOOM = "バーに沿って動かすことで拡大表示することができます。"; 
    var DESCRIPTION_FUNCTION_ZOOM_ATTENTION = ["拡大中はペンで記入したり、記入したものを消すことはできません。"]

    var DESCRIPTION_TITLE_SPEAKER = "スピーカー";
    var DESCRIPTION_FUNCTION_SPEAKER = "スピーカーのON/OFFを設定します。";
    var DESCRIPTION_FUNCTION_SPEAKER_ATTENTION = ["設定を変更するたびにフリーズ/回転/ズームは解除されます。"];

    var DESCRIPTION_TITLE_FULLSCREEN = "フルスクリーン";
    var DESCRIPTION_FUNCTION_FULLSCREEN = "画面を最大にします。";
    var DESCRIPTION_FUNCTION_FULLSCREEN_ATTENTION = ["ブラウザのフルスクリーン設定と同時に使用することはできません。"];

    var DESCRIPTION_TITLE_MENUUP = "メニュー表示";
    var DESCRIPTION_FUNCTION_MENUUP = "メニューを表示します。"; 
    var DESCRIPTION_FUNCTION_MENUUP_ATTENTION = "";

    var DESCRIPTION_TITLE_MOVE = "メニュー配置変更";
    var DESCRIPTION_FUNCTION_MOVE = "メニューの配置を変更します。"; 
    var DESCRIPTION_FUNCTION_MOVE_ATTENTION = "";

    var DESCRIPTION_TITLE_CLOSE = "メニュー非表示";
    var DESCRIPTION_FUNCTION_CLOSE = "メニューを非表示にします。"; 
    var DESCRIPTION_FUNCTION_CLOSE_ATTENTION = ["メニューは、ペンで記入することで自動的に非表示になります。"]

    var DESCRIPTION_TITLE_TIMER = "タイマー";
    var DESCRIPTION_FUNCTION_TIMER = "小テストやリーディングなど時間をはかるときに使用します。";
    var DESCRIPTION_FUNCTION_TIMER_ATTENTION = ["タイマーが動いている間は時間の設定はできません。"];
/*
    var DESCRIPTION_TITLE_LOGIN = "ログイン";
    var DESCRIPTION_FUNCTION_LOGIN = "ログインすることでファイルをアップロードできます。" ;
    var DESCRIPTION_FUNCTION_LOGIN_ATTENTION = ["アカウントをお持ちでない場合は、アカウントを作成してください。"];
*/
    var DESCRIPTION_TITLE_CALIB = "キャリブレーション";
    var DESCRIPTION_FUNCTION_CALIB = "ChromeOSにてCRB-3(ユニット型電子黒板)を使用される際に必要な" + "</br>"
        + "キャリブレーションを行うためのポイント位置が表示されます。" + "<br>"
        + "ご使用にあたってはCRB-3の取扱説明書に従って設置を行い、ご使用ください。" + "<br>";
    var DESCRIPTION_FUNCTION_CALIB_ATTENTION = ["ChromeOSではマウスポインタが表示されません。"];

    var SUPPORTED_LIST_OS = "対応OS"; 
    var SUPPORTED_LIST_OS_CONTENT = "<br>"
        + "Windows (10 21H2 以降)" + "<br>"
        + "macOS (Catalina 10.15 以降)" + "<br>"
        + "Chrome OS (66.0.3359.203 以降)" + "<br>"
        + "iPadOS (17 以降)" + "<br>"
        + "<br>";
    var SUPPORTED_LIST_BROWSER = "対応ブラウザ"; 
/*
    var SUPPORTED_LIST_BROWSER_CONTENT = "Chrome (67.0.3396.87 以降)" + "<br>"
        + "Safari (11.1.2 以降)" + "<br>"
        + "Edge (42 以降)" + "<br>";
*/
    var SUPPORTED_LIST_BROWSER_CONTENT = "Chrome (67.0.3396.87 以降)";
    var SUPPORTED_ATTENTION = "iPadOSは複数の書画カメラを接続して使用できません。"
    var SUPPORTED_ATTENTION2 = "iPadOSは動画再生に非対応となります。"
    var TRADEMARK_TITLE = "商標";
    var TRADEMARK_TEXT = "<br>" + "© 2017 Google LLC All rights reserved. Chrome™ ブラウザ は Google LLC の商標です。" + "<br>" +
    "© 2017 Google LLC All rights reserved. Google Apps™ は Google LLC の商標です。" + "<br>" +
/*
    "c 2017 Google LLC All rights reserved. Google ドライブ?? は Google LLC の商標です。" + "<br>" +
*/
    "© TECHNO HORIZON Co., Ltd. All Rights Reserved. Image Mate™ はテクノホライゾン株式会社の商標です。";
    var TRADEMARK_ATTENTION = "";

    document.getElementById('checkvisibleJP').style.display = "block";

    var LIST_DOCUMENT_INVALID_IMG = "images/list_document_invalid.png";
    var LIST_DOCUMENT_VALID_IMG = "images/list_document_valid.png";
    var LIST_DOCUMENT_VALID_CAMERA_IMG = "images/list_document_valid_camera.png";
/*
    var LIST_DOCUMENT_VALID_DRIVE_IMG = "images/list_document_valid_drive.png";
*/
    var FEATURE_WHITEBOARD_IMG = "images/Feature_whiteboard.jpg";
    var FEATURE_CONTENTS_IMG = "images/Feature_contents.jpg";
    var FEATURE_CAMERA_IMG = "images/Feature_camera.jpg";
/*
    var FEATURE_DRIVE_IMG = "images/Feature_drive.jpg";
*/
} else {
    document.documentElement.lang = "en";
    var IM_TITLE = "Image Mate + C";
    var COMMON_BUTTON_FEATURE = "Feature";
    var COMMON_BUTTON_FUNCTION = "Function";
    var COMMON_BUTTON_SUPPOTED  = "System Requirements";
    var COMMON_BUTTON_DISCLAMER  = "Disclaimer";
    var COMMON_BUTTON_TRADEMARK  = "Trademark";
    var COMMON_CHECK_VISIBLE = "Do not show this again";

    var FEATURE_BUTTON_WHITEBOARD = "White Board";
    var FEATURE_BUTTON_CONTENTS = "Contents";
    var FEATURE_BUTTON_CAMERA = "Camera";
/*
    var FEATURE_BUTTON_DRIVE = "Upload";
*/
    var DESCRIPTION_FEATURE = "All you need to use is connecting Document Camera.Extra setting is not necessary";
    var DESCRIPTION_FEATURE2_WHITE_BOARD = "you can draw something and caputure window."
        + "<br>" + "Capturing image is selected by Contents in list.";
    var DESCRIPTION_FEATURE2_CONTENTS = "You can play back image and video that you download with this application."
        + "<br>" + "On top of that,  Displayed image and video is pictured by pen and you can download it.";
    var DESCRIPTION_FEATURE2_CAMERA = "When you connect Document Camera to PC, icon of Document Camera show up in list."
        + "<br>" + "If you click that icon, camera image is displayed on the screen.";
/*
    var DESCRIPTION_FEATURE2_DRIVE = "Upload the file by logging in and capture / recording."
        + "<br>" + "By selecting Google Drive ? from the list you can set the uploaded file as the background.";
*/
    var DESCRIPTION_ATTENTION = "If you don't find camera icon, please refresh your browser";
    var DESCRIPTION_ATTENTION2 = "Supported contents are images(png/jpg/bmp) and movies(webm/mp4).";
    var DESCRIPTION_ATTENTION3 = "We have four whiteboards, but please save them individually.";
    var DESCRIPTION_FEATURE_SUBTITLE = "Easy to Setup!";
    var DESCRIPTION_FEATURE_USECASE_WHITEBOARD = "<b>" + "■ How to use(White Board)" + "</b>";
    var DESCRIPTION_FEATURE_USECASE_CONTENTS = "<b>" + "■ How to use(Contents)" + "</b>";
    var DESCRIPTION_FEATURE_USECASE_CAMERA = "<b>" + "■ How to use(Camera)" + "</b>";
/*
    var DESCRIPTION_FEATURE_USECASE_DRIVE = "<b>" + "■ How to use(Upload)" + "</b>";
*/
    var FUNCTION_BUTTON_ICON = "Icons";
    var FUNCTION_BUTTON_OTHERS = "Others";
    var FUNCTION_SUBTITLE = "Function Description";
    var FUNCTION_ATTENTION_TEXT = "Attention";

    var DESCRIPTION_TITLE_PEN = "Pen Function";
    var DESCRIPTION_FUNCTION_PEN = "make free hand drawings in Main Window. You can select eight types of color.";
    var DESCRIPTION_FUNCTION_PEN_ATTENTION =["You can not draw In Main Window by pen tool during Zoom-in with Zoom-bar"
        , "You can not record pen action if UVC video device is displayed in Main Window" 
        , "The object you draw is not reflected in the Freeze/Rotation function."];

    var DESCRIPTION_TITLE_MARKER = "MARKER Function";
    var DESCRIPTION_FUNCTION_MARKER = "make free hand drawings translucently in Main Window. You can select eight types of color.";
    var DESCRIPTION_FUNCTION_MARKER_ATTENTION =["You can not draw In Main Window by marker pen tool during Zoom-in with Zoom-bar"
        , "You can not record marker pen action if UVC video device is displayed in Main Window" 
        , "The object you draw is not reflected in the Freeze/Rotation function."];

    var DESCRIPTION_TITLE_ERASER = "ERASER Function";
    var DESCRIPTION_FUNCTION_ERASER = "erase objects you have drawn.";
    var DESCRIPTION_FUNCTION_ERASER_ATTENTION = ["You can not erase objects during Zoom-in with Zoom-bar"
        , "You can not revert to object which you erase"];

    var DESCRIPTION_TITLE_HAND = "SELECT Function";
    var DESCRIPTION_FUNCTION_HAND = "select objects you have drawn.";
    var DESCRIPTION_FUNCTION_HAND_ATTENTION = ["You can not select lines when uploaded files are taken as background. (Instead, move the background.)"];

    var DESCRIPTION_TITLE_STILL = "STILL Function";
    var DESCRIPTION_FUNCTION_STILL = "capture Window image";
    var DESCRIPTION_FUNCTION_STILL_ATTENTION = ["If you capture image during zoom-in, the image is not zoomed in image.Captured image is not changed whether Zoom-in or not."];

    var DESCRIPTION_TITLE_RECORD = "RECORD Function";
    var DESCRIPTION_FUNCTION_RECORD = "record Window image" + "<br>" + "You can play recorded video files (webm files) by selecting from the contents." + "<br>" + "You can also play it on Chrome™ browser, VLC media player.";
    var DESCRIPTION_FUNCTION_RECORD_ATTENTION = ["You can not record of object you draw and your operation.<br>"
                                                 , "If you capture video during zoom-in, the video is not zoomed in video.Captured video is not changed whether Zoom-in or not."
                                                 , "If you use ROTATION function during record, it does not relect to Video image."
                                                 , "If you use FREEZE function during record, it does not relect to Video image."];
                                                
    var DESCRIPTION_TITLE_FREEZE = "FREEZE Function";
    var DESCRIPTION_FUNCTION_FREEZE = "pause or restart background image when you select video contents and UVC camera.";
    var DESCRIPTION_FUNCTION_FREEZE_ATTENTION = "";

    var DESCRIPTION_TITLE_ROTATION = "ROTATION Function";
    var DESCRIPTION_FUNCTION_ROTATION = "rotate the Window image(0°/180°) ";
    var DESCRIPTION_FUNCTION_ROTATION_ATTENTION = ["The object you draw is not reflected in the Rotation function."];

    var DESCRIPTION_TITLE_ZOOM = "ZOOM";
    var DESCRIPTION_FUNCTION_ZOOM = "moving zoom-icon along ZOOM-bar is   zoom-in the Main Window image."; 
    var DESCRIPTION_FUNCTION_ZOOM_ATTENTION = ["You can not draw or erase anything In Main Window  during Zoom-in with Zoom-bar"];

    var DESCRIPTION_TITLE_SPEAKER = "SPEAKER";
    var DESCRIPTION_FUNCTION_SPEAKER = "set the speaker.";
    var DESCRIPTION_FUNCTION_SPEAKER_ATTENTION = ["Freeze / rotate / zoom will be canceled each time you change the setting."];

    var DESCRIPTION_TITLE_FULLSCREEN = "FULL SCREEN";
    var DESCRIPTION_FUNCTION_FULLSCREEN = "make windows full screen.";
    var DESCRIPTION_FUNCTION_FULLSCREEN_ATTENTION = ["It can not be used simultaneously with full screen setting of the browser."];

    var DESCRIPTION_TITLE_MENUUP = "SHOW THE MENU";
    var DESCRIPTION_FUNCTION_MENUUP = "show the menu"; 
    var DESCRIPTION_FUNCTION_MENUUP_ATTENTION = "";

    var DESCRIPTION_TITLE_MOVE = "ARRANGE THE MENU";
    var DESCRIPTION_FUNCTION_MOVE = "change the layout of the menu";
    var DESCRIPTION_FUNCTION_MOVE_ATTENTION = "";

    var DESCRIPTION_TITLE_CLOSE = "HIDE THE MENU";
    var DESCRIPTION_FUNCTION_CLOSE = "hide the menu"; 
    var DESCRIPTION_FUNCTION_CLOSE_ATTENTION = ["If you click the Main Windows, the menu is hidden automatically."];

    var DESCRIPTION_TITLE_TIMER = "TIMER";
    var DESCRIPTION_FUNCTION_TIMER = "It is used to measure time.";
    var DESCRIPTION_FUNCTION_TIMER_ATTENTION = ["You can not set the time while the timer is running."];
/*
    var DESCRIPTION_TITLE_LOGIN = "LOGIN THE ACCOUNT";
    var DESCRIPTION_FUNCTION_LOGIN = "Once you log in you can upload files.";
    var DESCRIPTION_FUNCTION_LOGIN_ATTENTION = ["If you do not have a Account, please create an account."];
*/
    var DESCRIPTION_TITLE_CALIB = "CALIBRATION";
    var DESCRIPTION_FUNCTION_CALIB = "The points for performing the necessary calibration" + "</br>"
        + "when using CRB-3 (unit-type electronic whiteboard) on ChromeOS are displayed." + "<br>"
        + "Please install and use the CRB-3 according to the instruction manual." + "<br>";
    var DESCRIPTION_FUNCTION_CALIB_ATTENTION = ["The mouse pointer is not visible on ChromeOS."];

    var SUPPORTED_LIST_OS = "Supported OS"; 
    var SUPPORTED_LIST_OS_CONTENT = "<br>"
        + "Windows (10 21H2 or later)" + "<br>"
        + "macOS (Catalina 10.15 or later)" + "<br>"
        + "Chrome OS (66.0.3359.203 or later)" + "<br>"
        + "iPadOS (17 and later)" + "<br>"
        + "<br>";
    var SUPPORTED_LIST_BROWSER = "Supported Browser"; 
/*
    var SUPPORTED_LIST_BROWSER_CONTENT = "Chrome (67.0.3396.87 or later)" + "<br>"
        + "Safari (11.1.2 or later)" + "<br>"
        + "Edge (42 or later)" + "<br>";
*/
    var SUPPORTED_LIST_BROWSER_CONTENT = "Chrome (67.0.3396.87 or later)";
    var SUPPORTED_ATTENTION = "iPadOS does not support connecting and using multiple document cameras.";
    var SUPPORTED_ATTENTION2 = "iPadOS does not support video playback."
    var TRADEMARK_TITLE = "Trademark";
    var TRADEMARK_TEXT = "<br>" + "© 2018 Google LLC All rights reserved. Chrome Browser™ is a trademark of Google LLC" + "<br>" +
    "© 2018 Google LLC All rights reserved. Google Apps™ is a trademark of Google LLC" + "<br>" +
/*
    "c2018 Google LLC All rights reserved. Google Drive? is a trademark of Google LLC" + "<br>" +
*/
    "© TECHNO HORIZON Co., Ltd. All Rights Reserved. Image Mate™ is a trademark of TECHNO HORIZON";
    var TRADEMARK_ATTENTION = "";

    document.getElementById('checkvisibleEN').style.display = "block";

    var LIST_DOCUMENT_INVALID_IMG = "images/list_document_invalid_E.png";
    var LIST_DOCUMENT_VALID_IMG = "images/list_document_valid_E.png";
    var LIST_DOCUMENT_VALID_CAMERA_IMG = "images/list_document_valid_camera_E.png";
/*
    var LIST_DOCUMENT_VALID_DRIVE_IMG = "images/list_document_valid_drive_E.png";
*/
    var FEATURE_WHITEBOARD_IMG = "images/Feature_whiteboard_E.jpg";
    var FEATURE_CONTENTS_IMG = "images/Feature_contents_E.jpg";
    var FEATURE_CAMERA_IMG = "images/Feature_camera_E.jpg";
/*
    var FEATURE_DRIVE_IMG = "images/Feature_drive_E.jpg";
*/
}

/* ------------------------------------------------------------------------------------------------ */
var storage = localStorage;

var featureButton = document.getElementById('boxAA');
var functionButton  = document.getElementById('boxAB');
var suppotedButton = document.getElementById('boxAC');
var disclaimerButton = document.getElementById('boxAD');
var trademarkButton = document.getElementById('boxAE');
var el_feature = document.getElementById('feature');
var el_function = document.getElementById('function');
var el_suppoted = document.getElementById('suppoted');
var el_disclaimer = document.getElementById('disclaimer');
var el_trademark = document.getElementById('trademark');
var featureContainer = document.getElementById('feature_container');

var feature_WindowsImg_whiteboard = document.getElementById('WindowsImg_whiteboard');
var feature_WindowsImg_contents = document.getElementById('WindowsImg_Contents');
var feature_WindowsImg_camera = document.getElementById('WindowsImg_Camera');
/*
var feature_WindowsImg_drive = document.getElementById('WindowsImg_Drive');
*/
var feature_ListImg_invalid = document.getElementsByClassName('listPicture_invalid');
var feature_ListImg_valid = document.getElementById('listPicture_valid');
var feature_ListImg_valid_camera = document.getElementById('listPicture_valid_camera');
/*
var feature_ListImg_valid_drive = document.getElementById('listPicture_valid_drive');
*/
var descriptionFeatureTitle = document.getElementById('descriptionFeatureTitle');

var FeatureButtonWhiteBoard = document.getElementsByClassName('box_whiteboard');
var FeatureButtonContents = document.getElementsByClassName('box_contents');
var FeatureButtonCamera = document.getElementsByClassName('box_camera');
/*
var FeatureButtonDrive = document.getElementsByClassName('box_drive');
*/
var FeatureDisplayWhiteBoard = document.getElementById('feature_display_whiteboard');
var FeatureDisplayContents = document.getElementById('feature_display_contents');
var FeatureDisplayCamera = document.getElementById('feature_display_camera');
/*
var FeatureDisplayDrive = document.getElementById('feature_display_drive');
*/
var descriptionButton = document.getElementsByClassName('container2')[0];
var functionTextAttention = document.getElementById('functionAttention');
var functionButton_icon   = document.getElementById('function_buttonA');
var functionButton_others = document.getElementById('function_buttonB');
var descriptionIcon = document.getElementById('function_description_icon');
var descriptionOthers = document.getElementById('function_description_others');
var descriptionBackgroundIcon = document.getElementsByClassName('background_img');
var descriptionButton_array = descriptionButton.children;
var descriptionButton_array_others = descriptionOthers.children;
/*
descriptionButton_array[1].parentNode.insertBefore(document.getElementById('btn_fullscrean'),descriptionButton[1]);
descriptionButton_array[1].parentNode.insertBefore(document.getElementById('btn_fullscrean'),descriptionButton[1]);

var descriptionButton = document.getElementsByName('icon_description');
*/
var descriptionButtonHelp = document.getElementById('btn_help');
var nextDisplay = document.getElementsByName('nextDisplay')[0];
var closeInfo = document.getElementsByClassName('modal-close')[0];
var descriptionTitle = document.getElementById('description_title');
var descriptionTextDots = document.getElementById('description_text_dots');
var descriptionTextText = document.getElementById('descriptionAttention_text');
var descriptionText = document.getElementById('description_text');
/*
var descriptionTitle2 = document.getElementById('description_title2');
*/
var descriptionText2 = document.getElementById('description_text2');
/*
var descriptionTitle3 = document.getElementById('description_title3');
*/
var descriptionText3 = document.getElementById('description_text3');
var descriptionFeatur = document.getElementById('descriptionFeature');
var descriptionFeatur2 = document.getElementById('descriptionFeature2');
var descriptionFeatureAttention = document.getElementById('descriptionFeatureAttention');
var descriptionFeatureAttention2 = document.getElementById('descriptionFeatureAttention2');
var descriptionFeatureAttention3 = document.getElementById('descriptionFeatureAttention3');
var descriptionAttention = document.getElementsByClassName('descriptionAttention')[0];

$('.checkvisible').attr('checked', storage.getItem("IMC_nextDisplay") == "true" ? true : false);

document.getElementById('eitTitle').innerHTML = IM_TITLE + "&nbsp;&nbsp;&nbsp;Ver." + VERSION;
featureButton.value = COMMON_BUTTON_FEATURE;
functionButton.value = COMMON_BUTTON_FUNCTION;
suppotedButton.value = COMMON_BUTTON_SUPPOTED;
disclaimerButton.value = COMMON_BUTTON_DISCLAMER;
trademarkButton.value = COMMON_BUTTON_TRADEMARK;

document.getElementById('featureSubtitle').innerHTML = DESCRIPTION_FEATURE_SUBTITLE ;
descriptionFeatureTitle.innerHTML = DESCRIPTION_FEATURE_USECASE_CAMERA;
descriptionFeatur2.innerHTML=DESCRIPTION_FEATURE2_CAMERA;
/*
document.getElementById('checkvisible').innerHTML= COMMON_CHECK_VISIBLE;
*/
for (button of FeatureButtonWhiteBoard) {
    button.value = FEATURE_BUTTON_WHITEBOARD;
}
for (button of FeatureButtonContents) {
    button.value = FEATURE_BUTTON_CONTENTS;
}
for (button of FeatureButtonCamera) {
    button.value = FEATURE_BUTTON_CAMERA ;
    button.style.backgroundColor = "white";
}
/*
for (button of FeatureButtonDrive) {
    button.value = FEATURE_BUTTON_DRIVE ;
}
*/
descriptionFeatur.innerHTML="&nbsp&nbsp" + DESCRIPTION_FEATURE;
descriptionFeatureAttention.innerHTML = DESCRIPTION_ATTENTION; 
descriptionFeatureAttention2.innerHTML = DESCRIPTION_ATTENTION2;
descriptionFeatureAttention3.innerHTML = DESCRIPTION_ATTENTION3;
document.getElementById('functionAttentionText').innerHTML = FUNCTION_ATTENTION_TEXT;
feature_WindowsImg_whiteboard.src = FEATURE_WHITEBOARD_IMG ;
feature_WindowsImg_contents.src = FEATURE_CONTENTS_IMG;
feature_WindowsImg_camera.src = FEATURE_CAMERA_IMG ;
/*
feature_WindowsImg_drive.src = FEATURE_DRIVE_IMG;
*/
feature_ListImg_valid.src = LIST_DOCUMENT_VALID_IMG;
feature_ListImg_valid_camera.src = LIST_DOCUMENT_VALID_CAMERA_IMG;
/*
feature_ListImg_valid_drive.src = LIST_DOCUMENT_VALID_DRIVE_IMG;
*/
for (img of feature_ListImg_invalid) {
    img.src = LIST_DOCUMENT_INVALID_IMG;
}

document.getElementById('function_buttonA').value =FUNCTION_BUTTON_ICON ;
document.getElementById('function_buttonB').value =FUNCTION_BUTTON_OTHERS ;
descriptionText.innerHTML= DESCRIPTION_FUNCTION_PEN; 
descriptionTitle.innerHTML= DESCRIPTION_TITLE_PEN; 
/*
descriptionAttention.innerHTML=DESCRIPTION_FUNCTION_PEN_ATTENTION;
*/
drawDescriptionAttention(DESCRIPTION_FUNCTION_ZOOM_ATTENTION);
var descriptionTextAttention_Others_store = descriptionAttention.innerHTML;
drawDescriptionAttention(DESCRIPTION_FUNCTION_PEN_ATTENTION);
var descriptionTextAttention_Icon_store = descriptionAttention.innerHTML;
document.getElementById('box-title').innerHTML = FUNCTION_SUBTITLE;
var descriptionTitle_Icon_store = DESCRIPTION_TITLE_PEN ;
var descriptionText_Icon_store = DESCRIPTION_FUNCTION_PEN ;
var descriptionTitle_Others_store = DESCRIPTION_TITLE_ZOOM ;
var descriptionText_Others_store = DESCRIPTION_FUNCTION_ZOOM ;

document.getElementById('list_OS').innerHTML = SUPPORTED_LIST_OS;
document.getElementById('list_supported_os').innerHTML = SUPPORTED_LIST_OS_CONTENT;
document.getElementById('list_browser').innerHTML = SUPPORTED_LIST_BROWSER;
document.getElementById('list_supported_browser').innerHTML = SUPPORTED_LIST_BROWSER_CONTENT;
document.getElementById('suppoted_attention').innerHTML = SUPPORTED_ATTENTION;
document.getElementById('suppoted_attention2').innerHTML = SUPPORTED_ATTENTION2;

descriptionText2.innerHTML= DISCLAIMER_TEXT;
/*
descriptionTitle2.innerHTML= DISCLAIMER_TITLE;
*/
document.getElementById('box-title2').innerHTML = DISCLAIMER_TITLE;
document.getElementById('disclaimer_attention').innerHTML = DISCLAIMER_ATTENTION;

descriptionText3.innerHTML= TRADEMARK_TEXT;
/*
descriptionTitle3.innerHTML= TRADEMARK_TITLE;
*/
document.getElementById('box-title3').innerHTML = TRADEMARK_TITLE;
/*
document.getElementById('trademark_attention').innerHTML = TRADEMARK_ATTENTION;
*/
/* ------------------------------------------------------------------------------------------------ */
function setlocalStorage(value) {
    var key = "IMC_nextDisplay";
    var val = value;
    if (key && val) {
        storage.setItem(key, val);
    }
    key = "";
    val = "";
}

/* ------------------------------------------------------------------------------------------------ */
function switch_function_description(elment,button) {
    if (functionButton_icon.style.backgroundColor == "white") {
        descriptionTitle_Icon_store = descriptionTitle.innerHTML; 
        descriptionText_Icon_store = descriptionText.innerHTML;
        descriptionTextAttention_Icon_store = descriptionAttention.innerHTML;
    } else if (functionButton_others.style.backgroundColor == "white") {
        descriptionTitle_Others_store = descriptionTitle.innerHTML; 
        descriptionText_Others_store = descriptionText.innerHTML;
        descriptionTextAttention_Others_store = descriptionAttention.innerHTML;
    }
    descriptionIcon.style.display = "none";
    descriptionOthers.style.display = "none";
    functionButton_icon.style.backgroundColor = "rgba(0,160,239,1.0)";
    functionButton_others.style.backgroundColor = "";
    if (elment == descriptionIcon ) {
        elment.style.display = "block";
        descriptionTitle.innerHTML = descriptionTitle_Icon_store ;
        descriptionText.innerHTML = descriptionText_Icon_store ;
        descriptionAttention.innerHTML = descriptionTextAttention_Icon_store;
    } else if (elment == descriptionOthers ) {
        elment.style.display = "flex";
        descriptionTitle.innerHTML = descriptionTitle_Others_store;
        descriptionText.innerHTML = descriptionText_Others_store;
        descriptionAttention.innerHTML = descriptionTextAttention_Others_store;
    }
    if (descriptionAttention.innerHTML == "") {
        functionTextAttention.style.display="none";
    } else {
        functionTextAttention.style.display="block";
    }
    button.style.backgroundColor = "white";
}

/* ------------------------------------------------------------------------------------------------ */
function switch_feature_display(elment,buttons) {
    FeatureDisplayWhiteBoard.style.display = "none";
    FeatureDisplayContents.style.display = "none";
    FeatureDisplayCamera.style.display = "none";
/*
    FeatureDisplayDrive.style.display = "none";
*/
    for (button of FeatureButtonWhiteBoard) {
        button.style.backgroundColor = "";
    }
    for (button of FeatureButtonContents) {
        button.style.backgroundColor = "";
    }
    for (button of FeatureButtonCamera) {
        button.style.backgroundColor = "rgba(0,160,239,1.0)";
    }
/*
    for (button of FeatureButtonDrive) {
        button.style.backgroundColor = "";
    }
*/
    elment.style.display = "block";
/*
    button.style.backgroundColor = "white";
*/
    for (button of buttons) {
        button.style.backgroundColor = "white";
    }
    if (buttons  == FeatureButtonWhiteBoard ) {
        descriptionFeatureTitle.innerHTML = DESCRIPTION_FEATURE_USECASE_WHITEBOARD;
        descriptionFeatur2.innerHTML=DESCRIPTION_FEATURE2_WHITE_BOARD;
    } else if (buttons == FeatureButtonContents) {
        descriptionFeatureTitle.innerHTML = DESCRIPTION_FEATURE_USECASE_CONTENTS;
        descriptionFeatur2.innerHTML=DESCRIPTION_FEATURE2_CONTENTS;
    } else if (buttons == FeatureButtonCamera) {
        descriptionFeatureTitle.innerHTML = DESCRIPTION_FEATURE_USECASE_CAMERA;
        descriptionFeatur2.innerHTML=DESCRIPTION_FEATURE2_CAMERA;
/*
    } else if (buttons == FeatureButtonDrive) {
        descriptionFeatureTitle.innerHTML = DESCRIPTION_FEATURE_USECASE_DRIVE;
        descriptionFeatur2.innerHTML=DESCRIPTION_FEATURE2_DRIVE;
*/
    }
}

/* ------------------------------------------------------------------------------------------------ */
function switch_display(elment,button) {
    el_feature.style.display = "none";
    el_function.style.display = "none";
    el_suppoted.style.display = "none";
    el_disclaimer.style.display = "none";
    el_trademark.style.display = "none";
    featureButton.style.backgroundColor = "rgba(0,160,239,1.0)";
    functionButton.style.backgroundColor = "";
    suppotedButton.style.backgroundColor = "";
    disclaimerButton.style.backgroundColor = "";
    trademarkButton.style.backgroundColor = "";

    elment.style.display = "block";
    button.style.backgroundColor = "white";
}
function drawDescriptionAttention(str_array) {
    descriptionAttention.innerHTML = "";
    for (str of str_array) {
        if (descriptionAttention.innerHTML != "") {
            descriptionAttention.innerHTML = descriptionAttention.innerHTML + '<div><div id="description_text_dots">' + '・' + '</div>' + '<div id="descriptionAttention_text">' + str + '</div><br></div>' ;
/*
            descriptionAttention.innerHTML =  '<div id="description_text_dots">' + '・' + '</div>' + '<div id="descriptionAttention_text">' + str + '</div>' ;
*/
        } else {
            descriptionAttention.innerHTML = '<div ><div id="description_text_dots">' + '・' + '</div>' + '<div id="descriptionAttention_text">' + str + '</div><br></div>' ;
        }
    }
}

/* ------------------------------------------------------------------------------------------------ */
function display_border_line(element,option) {
    let element_id;
    if (option == "icon") {
        for (button of descriptionButton_array) {
            button.style.border="solid 0px";
            button.style.borderRadius="0px";
        }
        element_id = element.id;
    } else if (option =="others") {
        for (button of descriptionButton_array_others) {
            button.style.border="solid 0px";
            button.style.borderRadius="0px";
            for (icon of descriptionBackgroundIcon ) {
                if (button == icon) {
                    button.style.border="3px solid white";
                    button.style.borderRadius="8px";
                }
            }
        }
        element_id = element.children[0].id;
    }
    element.style.borderRadius="20px";
    element.style.border="solid 10px orange";
    switch (element_id) {
        case "btn_pen":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_PEN; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_PEN; 
            drawDescriptionAttention(DESCRIPTION_FUNCTION_PEN_ATTENTION);
            break;
        case "btn_marker":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_MARKER; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_MARKER; 
            drawDescriptionAttention(DESCRIPTION_FUNCTION_MARKER_ATTENTION);
            break;
        case "btn_eraser":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_ERASER; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_ERASER; 
            drawDescriptionAttention(DESCRIPTION_FUNCTION_ERASER_ATTENTION);
            break;
        case "btn_hand":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_HAND;
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_HAND;
            drawDescriptionAttention([]);
/*
            drawDescriptionAttention(DESCRIPTION_FUNCTION_HAND_ATTENTION);
*/
            break;
        case "btn_still":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_STILL; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_STILL;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_STILL_ATTENTION);
            break;
        case "btn_record":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_RECORD; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_RECORD;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_RECORD_ATTENTION);
            break;
        case "btn_freeze":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_FREEZE; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_FREEZE;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_FREEZE_ATTENTION);
            break;
        case "btn_rotation":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_ROTATION; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_ROTATION ;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_ROTATION_ATTENTION);
            break;
        case "btn_zoom":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_ZOOM; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_ZOOM;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_ZOOM_ATTENTION);
            break;
        case "btn_speaker":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_SPEAKER;
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_SPEAKER;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_SPEAKER_ATTENTION);
            break;
        case "btn_fullscrean":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_FULLSCREEN;
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_FULLSCREEN;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_FULLSCREEN_ATTENTION);
            break;
        case "btn_menu_up":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_MENUUP; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_MENUUP;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_MENUUP_ATTENTION);
            break;
        case "btn_move":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_MOVE; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_MOVE;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_MOVE_ATTENTION);
            break;
        case "btn_close":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_CLOSE; 
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_CLOSE;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_CLOSE_ATTENTION);
            break;
        case "btn_timer":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_TIMER;
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_TIMER;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_TIMER_ATTENTION);
            break;
        case "btn_login":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_LOGIN;
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_LOGIN;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_LOGIN_ATTENTION);
            break;
        case "btn_calib":
            descriptionTitle.innerHTML = DESCRIPTION_TITLE_CALIB;
            descriptionText.innerHTML = DESCRIPTION_FUNCTION_CALIB;
            drawDescriptionAttention(DESCRIPTION_FUNCTION_CALIB_ATTENTION);
            break;
    }
    if (descriptionAttention.innerHTML == "") {
        functionTextAttention.style.display="none";
    } else {
        functionTextAttention.style.display="block";
    }
}

/* ------------------------------------------------------------------------------------------------ */
function proc() {
    var favDialog = document.getElementById('favDialog');
    favDialog.showModal();
    if (storage.getItem("IMC_nextDisplay") == "true") {
        switch_display(el_feature, featureButton);
    } else {
        switch_display(el_disclaimer, disclaimerButton);
    }
    switch_feature_display(FeatureDisplayCamera , FeatureButtonCamera);
    switch_function_description(descriptionIcon ,functionButton_icon );
    for (button of descriptionButton_array) {
        button.addEventListener('click', function() {
            display_border_line(this,"icon");
        });
    }
    for (button of descriptionButton_array_others) {
        button.addEventListener('click', function() {
            display_border_line(this,"others");
        });
    }
    featureButton.addEventListener('click', function() {
        switch_display(el_feature, featureButton);
    });
    functionButton.addEventListener('click', function() {
        switch_display(el_function, functionButton);
    });
    suppotedButton.addEventListener('click', function() {
        switch_display(el_suppoted, suppotedButton);
    });
    disclaimerButton.addEventListener('click', function() {
        switch_display(el_disclaimer, disclaimerButton);
    });
    trademarkButton.addEventListener('click', function() {
        switch_display(el_trademark, trademarkButton);
    });
    for (button of FeatureButtonWhiteBoard) {
        button.addEventListener('click', function() {
            switch_feature_display(FeatureDisplayWhiteBoard , FeatureButtonWhiteBoard);
        });
    }
    for (button of FeatureButtonContents) {
        button.addEventListener('click', function() {
            switch_feature_display(FeatureDisplayContents , FeatureButtonContents);
        });
    }
    for (button of FeatureButtonCamera) {
        button.addEventListener('click', function() {
            switch_feature_display(FeatureDisplayCamera , FeatureButtonCamera);
        });
    }
/*
    for (button of FeatureButtonDrive) {
        button.addEventListener('click', function() {
            switch_feature_display(FeatureDisplayDrive , FeatureButtonDrive);
        });
    }
*/
    functionButton_icon.addEventListener('click', function() {
        switch_function_description(descriptionIcon ,functionButton_icon );
    });
    functionButton_others.addEventListener('click', function() {
        switch_function_description(descriptionOthers ,functionButton_others );
    });
}
