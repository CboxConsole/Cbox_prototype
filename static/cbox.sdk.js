// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Javascript module pattern:
//   see http://en.wikipedia.org/wiki/Unobtrusive_JavaScript#Namespaces
// In essence, we define an anonymous function which is immediately called and
// returns a new object. The new object contains only the exported definitions;
// all other definitions in the anonymous function are inaccessible to external
// code.
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Javascript module pattern:
//   see http://en.wikipedia.org/wiki/Unobtrusive_JavaScript#Namespaces
// In essence, we define an anonymous function which is immediately called and
// returns a new object. The new object contains only the exported definitions;
// all other definitions in the anonymous function are inaccessible to external
// code.
var common = (function () {

    /**
     * Create the Native Client <embed> element as a child of the DOM element
     * named "listener".
     *
     * @param {string} name The name of the example.
     * @param {string} tool The name of the toolchain, e.g. "glibc", "newlib" etc.
     * @param {string} config The name of the configruation, "Debug" or "Release"
     * @param {number} width The width to create the plugin.
     * @param {number} height The height to create the plugin.
     */
    function createNaClModule(name, tool, config, width, height) {
        var moduleEl = document.createElement('embed');
        moduleEl.setAttribute('name', 'nacl_module');
        moduleEl.setAttribute('id', 'nacl_module');
        moduleEl.setAttribute('width', width);
        moduleEl.setAttribute('height',height);
        moduleEl.setAttribute('src', tool + '/' + config + '/' + name + '.nmf');
        moduleEl.setAttribute('type', 'application/x-nacl');
        if (tool == 'win' || tool == 'linux' || tool == 'mac') {
            mimetype = 'application/x-ppapi-' + config.toLowerCase();
            moduleEl.setAttribute('type', mimetype);
        }

        // The <EMBED> element is wrapped inside a <DIV>, which has both a 'load'
        // and a 'message' event listener attached.  This wrapping method is used
        // instead of attaching the event listeners directly to the <EMBED> element
        // to ensure that the listeners are active before the NaCl module 'load'
        // event fires.
        var listenerDiv = document.getElementById('android');
        listenerDiv.appendChild(moduleEl);
    }

    /** Add the default "load" and "message" event listeners to the element with
     * id "listener".
     *
     * The "load" event is sent when the module is successfully loaded. The
     * "message" event is sent when the naclModule posts a message using
     * PPB_Messaging.PostMessage() (in C) or pp::Instance().PostMessage() (in
     * C++).
     */
    function attachDefaultListeners() {
        var listenerDiv = document.getElementById('android');
        listenerDiv.addEventListener('load', moduleDidLoad, true);
        listenerDiv.addEventListener('message', handleMessage, true);

        var listenerDiv2 = document.getElementById('listenerWebSocket');
        listenerDiv2.addEventListener('load', moduleDidLoad, true);
        listenerDiv2.addEventListener('message', handleMessage2, true);


        if (typeof window.attachListeners !== 'undefined') {
            window.attachListeners();
        }
    }

    /**
     * Called when the NaCl module is loaded.
     *
     * This event listener is registered in createNaClModule above.
     */
    function moduleDidLoad() {
        common.naclModule = document.getElementById('nacl_module');
        updateStatus('SUCCESS');

        if (typeof window.moduleDidLoad !== 'undefined') {
            window.moduleDidLoad();
        }
    }

    /**
     * Hide the NaCl module's embed element.
     *
     * We don't want to hide by default; if we do, it is harder to determine that
     * a plugin failed to load. Instead, call this function inside the example's
     * "moduleDidLoad" function.
     *
     */
    function hideModule() {
        // Setting common.naclModule.style.display = "None" doesn't work; the
        // module will no longer be able to receive postMessages.
        common.naclModule.style.height = "0";
    }

    /**
     * Return true when |s| starts with the string |prefix|.
     *
     * @param {string} s The string to search.
     * @param {string} prefix The prefix to search for in |s|.
     */
    function startsWith(s, prefix) {
        // indexOf would search the entire string, lastIndexOf(p, 0) only checks at
        // the first index. See: http://stackoverflow.com/a/4579228
        return s.lastIndexOf(prefix, 0) === 0;
    }

    /**
     * Add a message to an element with id "log", separated by a <br> element.
     *
     * This function is used by the default "log:" message handler.
     *
     * @param {string} message The message to log.
     */
    function logMessage(message) {
        var logEl = document.getElementById('log');
        logEl.innerHTML += message + '<br>';
        console.log(message)
    }

    /**
     */
    var defaultMessageTypes = {
        'alert': alert,
        'log': logMessage
    };

    /**
     * Called when the NaCl module sends a message to JavaScript (via
     * PPB_Messaging.PostMessage())
     *
     * This event listener is registered in createNaClModule above.
     *
     * @param {Event} message_event A message event. message_event.data contains
     *     the data sent from the NaCl module.
     */
    function handleMessage(message_event) {
        if (typeof message_event.data === 'string') {
            for (var type in defaultMessageTypes) {
                if (defaultMessageTypes.hasOwnProperty(type)) {
                    if (startsWith(message_event.data, type + ':')) {
                        func = defaultMessageTypes[type];
                        func(message_event.data.slice(type.length + 1));
                    }
                }
            }
        }

        if (typeof window.handleMessage !== 'undefined') {
            window.handleMessage(message_event);
        }
    }

    /**
     * Called when the DOM content has loaded; i.e. the page's document is fully
     * parsed. At this point, we can safely query any elements in the document via
     * document.querySelector, document.getElementById, etc.
     *
     * @param {string} name The name of the example.
     * @param {string} tool The name of the toolchain, e.g. "glibc", "newlib" etc.
     * @param {string} config The name of the configuration, e.g. "Release", etc.
     * @param {number} width The width to create the plugin.
     * @param {number} height The height to create the plugin.
     */
    function domContentLoaded(name, tool, config, width, height) {
        // If the page loads before the Native Client module loads, then set the
        // status message indicating that the module is still loading.  Otherwise,
        // do not change the status message.
        updateStatus('Page loaded.');
        if (common.naclModule == null) {
            updateStatus('Creating embed: ' + tool)

            // We use a non-zero sized embed to give Chrome space to place the bad
            // plug-in graphic, if there is a problem.
            width = typeof width !== 'undefined' ? width : 200;
            height = typeof height !== 'undefined' ? height : 200;
            attachDefaultListeners();
            createNaClModule(name, tool, config, width, height);
        } else {
            // It's possible that the Native Client module onload event fired
            // before the page's onload event.  In this case, the status message
            // will reflect 'SUCCESS', but won't be displayed.  This call will
            // display the current message.
            updateStatus('Waiting.');
        }
    }

    /** Saved text to display in the element with id 'statusField'. */
    var statusText = 'NO-STATUSES';

    /**
     * Set the global status message. If the element with id 'statusField'
     * exists, then set its HTML to the status message as well.
     *
     * @param {string} opt_message The message to set. If null or undefined, then
     *     set element 'statusField' to the message from the last call to
     *     updateStatus.
     */
    function updateStatus(opt_message) {
        console.log(opt_message);
    }

    // The symbols to export.
    return {
        /** A reference to the NaCl module, once it is loaded. */
        naclModule: null,

        attachDefaultListeners: attachDefaultListeners,
        domContentLoaded: domContentLoaded,
        createNaClModule: createNaClModule,
        hideModule: hideModule,
        updateStatus: updateStatus
    };

}());


// Listen for the DOM content to be loaded. This event is fired when parsing of
// the page's document has finished.
document.addEventListener('DOMContentLoaded', function() {
    var body = document.querySelector('body');
    var loadFunction = common.domContentLoaded;

    if (loadFunction) {
        loadFunction("cbox_sdk", "static", "cbox_sdk",
            200, 200);

    }
});


//기본 값
var _nunchuck = {
    joyX : 126,
    joyY : 130,
    accX : 76,
    accY : 132,
    accZ : 130,
    btnC : 1,
    btnZ : 1
};

var updater = {
    socket: null,
    init : function() {
        updater.socket = document.getElementById('websocket');
        updater.start();
        setTimeout(function(){
            updater.socket.postMessage('s;Start');
        },1000);
    },
    start: function() {
        var url = "ws://localhost:8889/gamesocket";

        updater.socket.postMessage('o;' + url);
        console.log(url);


    },
    handleMessage: function(message_event) {
        try{

//			console.log(message_event.data);
            var oData = $.parseJSON(message_event.data.replace("receive: ", ""));
            //console.log(oData.aData);
            nunchuck.joyX = oData.aData[0];
            nunchuck.joyY = oData.aData[1];
            nunchuck.accX = oData.aData[2];
            nunchuck.accY = oData.aData[3];
            nunchuck.accZ = oData.aData[4];
            nunchuck.btnZ = oData.aData[5];
            nunchuck.btnC = oData.aData[6];

            if( _mode == 1 ){
                $jGameScreenIFrame[0].contentWindow._listen( nunchuck, _nunchuck);
            }

            if( nunchuck.btnC == 1 ){
                if( _nunchuck.btnC == 0 ){
                    // 클릭 된거임
                    _nunchuck.btnC = 1;
                    if( _mode == 0 ){
                        // 플랫폼인 경우엔 다음 게임 선택
                        nextGame();
                    }
                }
            }else{
                // 눌림 상태 설정
                _nunchuck.btnC = 0;
            }

            if( nunchuck.btnZ == 1 ){
                if( _nunchuck.btnZ == 0 ){
                    // 클릭 된거임
                    _nunchuck.btnZ = 1;
                    if( _mode == 0 ){
                        // 플랫폼인 경우엔 다음 게임 선택
                        selectGame();
                    }
                }
            }else{
                // 눌림 상태 설정
                _nunchuck.btnZ = 0;
            }


        }catch(e){
            console.log(e);
        }

    }
};

var _mode = "home";
jQuery(function ($) {
    window.cbox = {
        listener: undefined,
        context: undefined,
        addEventListener: function(listener, context) {
            window.cbox.listener = listener;
        },
        triggerEvent: function(ce) {
            !window.cbox.listener || window.cbox.listener(ce, cbox.context, window.cbox);
            pubsub.pub("controlls",{"data":ce});
        }
    };

    setTimeout(function(){
        updater.init();
    },1000);

    var CBOX_INPUT = {
        pX1 : 0,
        pY1 : 0,
        pX2 : 0,
        pY2 : 0,
        pX3 : 0,
        pY3 : 0,
        btnA : 0,
        btnB : 0,
        btnY : 0,
        btnX : 0,
        btnLB : 0,
        btnRB : 0,
        btnLT : 0,
        btnRT : 0,
        btnBack : 0,
        btnStart : 0,
        accX : 0,
        accY : 0,
        accZ : 0
    };

    var CBOX_SDK_focusIn = function(){
        var CBOX_INPUT = {
            pX1 : 0,
            pY1 : 0,
            pX2 : 0,
            pY2 : 0,
            pX3 : 0,
            pY3 : 0,
            btnA : 0,
            btnB : 0,
            btnY : 0,
            btnX : 0,
            btnLB : 0,
            btnRB : 0,
            btnLT : 0,
            btnRT : 0,
            btnBack : 0,
            btnStart : 0,
            accX : 0,
            accY : 0,
            accZ : 0
        };
    };
    var CBOX_SDK_focusOut = function(){
    };

    var CBOX_SDK_KEYMAP = {
        37 : 'left',
        38 : 'up',
        39 : 'right',
        40 : 'down',
        13 : 'btnA', //enter
        8 : 'back',
        27 : 'esc',
        65: 'btnA', // a
        83 : 'btnB', //s
        90 : 'btnY', //z
        88 : 'btnX' //x
    };

    var CBOX_SDK_keyboard = function(keycode,kind){
        //TODO : Connect Here for Keyboard Events
        // console.log(CBOX_INPUT.pX, keycode, CBOX_SDK_KEYMAP[keycode], kind);

        // for KeyDown
        if (kind == "Down") {
            switch(CBOX_SDK_KEYMAP[keycode]){
                case "left" :
                    CBOX_INPUT.pX1 -= 2;
                    break;
                case "up" :
                    CBOX_INPUT.pY1 -= 2;
                    break;
                case "right" :
                    CBOX_INPUT.pX1 += 2;
                    break;
                case "down" :
                    CBOX_INPUT.pY1 += 2;
                    break;
                case "back" :
                    break;
                case "esc" :
                    break;
                case "btnA" :
                    CBOX_INPUT.btnA = 1;
                    break;
                case "btnB" :
                    CBOX_INPUT.btnB = 1;
                    break;
                case "btnY" :
                    CBOX_INPUT.btnY = 1;
                    break;
                case "btnX" :
                    CBOX_INPUT.btnX = 1;
                    break;
            };
        }else{
            switch(CBOX_SDK_KEYMAP[keycode]){
                case "btnA" :
                    CBOX_INPUT.btnA = 0;
                    break;
                case "btnB" :
                    CBOX_INPUT.btnB = 0;
                    break;
                case "btnY" :
                    CBOX_INPUT.btnY = 0;
                    break;
                case "btnX" :
                    CBOX_INPUT.btnX = 0;
                    break;
            };
        }

        // add more information about keycode
        // CBOX_INPUT.keyCode = keycode;
        CBOX_INPUT.type = kind;

        // trigger event to listener
        cbox.triggerEvent(CBOX_INPUT, cbox.context, cbox);
    };
    var i = 0;
    var _btn = {

    }
    var CBOX_SDK_gamepad = function(){
        //console.log(_mode);
        if( _mode === "home"){
            i = (++i % 10);
        }else{
            i = 0;
        }
        if( i == 0 ){
            //console.debug(arguments,arguments.length);
            CBOX_INPUT.btnA = parseInt(arguments[4]);
            CBOX_INPUT.btnB = parseInt(arguments[5]);
            CBOX_INPUT.btnX= parseInt(arguments[6]);
            CBOX_INPUT.btnY = parseInt(arguments[7]);

            CBOX_INPUT.btnLB = parseInt(arguments[8]);
            CBOX_INPUT.btnRB = parseInt(arguments[9]);
            CBOX_INPUT.btnLT= (arguments[10]>0)?1:0;
            CBOX_INPUT.btnRT = (arguments[11]>0)?1:0;

            CBOX_INPUT.btnBack = parseInt(arguments[12]);
            CBOX_INPUT.btnStart = parseInt(arguments[13]);


            if(arguments[16] == 1){
                CBOX_INPUT.pY1 -= 2;
            }
            if(arguments[17] == 1 ){
                CBOX_INPUT.pY1 += 2;
            }
            if(arguments[18] == 1){
                CBOX_INPUT.pX1 -= 2;
            }
            if(arguments[19] == 1){
                CBOX_INPUT.pX1 += 2;
            }
            // for keyboard hack. :)
            CBOX_INPUT.type = "Down";

            if(arguments[0] <= 70){
                // left
                CBOX_INPUT.pX3 -= 2;
            }else if(arguments[0] >= 80){
                //right
                CBOX_INPUT.pX3 += 2;
            }
            if(arguments[1] <= 90 ){
                // left
                CBOX_INPUT.pY3 -= 2;
            }else if(arguments[1] >= 110){
                //right
                CBOX_INPUT.pY3 += 2;
            }

            if(arguments[2] <= 70){
                // left
                CBOX_INPUT.pX2 -= 2;
            }else if(arguments[2] >= 80){
                //right
                CBOX_INPUT.pX2 += 2;
            }
            if(arguments[3] <= 90 ){
                // left
                CBOX_INPUT.pY2 -= 2;
            }else if(arguments[3] >= 110){
                //right
                CBOX_INPUT.pY2 += 2;
            }


            cbox.triggerEvent(CBOX_INPUT);


            //joy1 - x arguments[0] // 73 50~100
            //joy1 - y arguments[1] // 98 0 ~200
            //joy2 - x arguments[2] // 72 50~100
            //joy2 - y arguments[3] // 105 0~200
            //btn A arguments[4]
            //btn B arguments[5]
            //btn X arguments[6]
            //btn Y arguments[7]
            //joy1 - x arguments[8]
            //joy1 - x arguments[9]
            //joy1 - x arguments[10]
            //joy1 - x arguments[11]
            //joy1 - x arguments[12]
            //joy1 - x arguments[13]
            //joy1 - x arguments[14]
            //joy1 - x arguments[15]
            //d but - up arguments[16]
            //d but - down arguments[17]
            //d but - left arguments[18]
            //d but - right arguments[10]
            //center X button arguments[20]
        }
    };

    var CBOX_SDK_nunchuk =  function(){
        // cbox.triggerEvent(CBOX_INPUT);
    };

    var _defaultFuncs = {
        "CBOX_SDK_focusIn" : CBOX_SDK_focusIn,
        "CBOX_SDK_focusOut" : CBOX_SDK_focusOut,
        "CBOX_SDK_keyboard" : CBOX_SDK_keyboard,
        "CBOX_SDK_gamepad" : CBOX_SDK_gamepad,
        "CBOX_SDK_nunchuk" : CBOX_SDK_nunchuk
    };

    // Called by the common.js module.
    window.handleMessage = function(message) {
        var _order = [];
        var func = function(){};

        if (typeof message.data === 'string') {
            if( message.data.indexOf("o::") == 0 ){
                _order = message.data.replace("o::","").split(":");
                func = _defaultFuncs[_order.shift()];
                if(func){
//                    console.log(message.data);
                    if( _order.length > 1 ){
                        func.apply(this||window,_order);
                    }else{
                        func();
                    }
                }
            }
        }
    }

    window.handleMessage2 = function(message) {
        var _order = [];
        var func = function(){};

        console.log(message);

        return;


    }




    $("#osx-modal-content").fadeIn('slow');


});
