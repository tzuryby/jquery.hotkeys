/******************************************************************************************************************************

Original idea by by Binny V A, Original version: 2.00.A 
http://www.openjs.com/scripts/events/keyboard_shortcuts/
 
jQuery Plugin by Tzury Bar Yochay 
    mail: tzury.by@gmail.com
    blog: evalinux.wordpress.com
    face: facebook.com/profile.php?id=513676303
    
    (c) Copyrights 2007
        
License: jQuery-License.
 
TODO:
    add queue support (as in gmail) e.g. 'x' then 'y', etc.
    add mouse + mouse wheel events.

USAGE:
    
    $.hotkeys.add('Ctrl+c', function(){ alert('copy anyone?');});
    
    // 'editor' is the id of the targeted element
    $.hotkeys.add('Ctrl+c', {target:'editor', type:'keypress', propagate: true},function(){ alert('copy anyone?');});>
    
    $.hotkeys.remove('Ctrl+c'); 
    $.hotkeys.remove('Ctrl+c', {target:'editor', type:'keypress'}); 
    
******************************************************************************************************************************/
(function (jQuery){
    var hotkeys = {};
    hotkeys.version = '(beta)(0.0.6)';
    hotkeys.all = {};
    
    // when using $.each(), each item gets an attribute hkId=newid() and hkId=type
    hotkeys.newid = function(){
        return (Math.random() *0x10000000000 | 0).toString(32).substring(1);
    };
    
    hotkeys.special_keys = {
        27: 'esc', 9: 'tab', 32:'space', 13: 'return', 8:'backspace', 145: 'scroll', 20: 'capslock', 
        144: 'numlock', 19:'pause', 45:'insert', 36:'home', 46:'del',35:'end', 33: 'pageup', 
        34:'pagedown', 37:'left', 38:'up', 39:'right',40:'down', 112:'f1',113:'f2', 114:'f3', 
        115:'f4', 116:'f5', 117:'f6', 118:'f7', 119:'f8', 120:'f9', 121:'f10', 122:'f11', 123:'f12' };
        
    hotkeys.shift_nums = {
        "`":"~", "1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&", 
        "8":"*", "9":"(", "0":")", "-":"_", "=":"+", ";":":", "'":"\"", ",":"<", 
        ".":">",  "/":"?",  "\\":"|" };

    // the event handler
    hotkeys.handler = function(event) {
        var options = event.data;
        // jQuery event normalization.
        //event = jQuery.event.fix(event); 
        console.log(event);
        console.log(options);
        var element = event.currentTarget;
        // @ TextNode -> nodeType == 3
        element = (element.nodeType === 3) ? element.parentNode : element;
        
        if(options['disableInInput']) { // Disable shortcut keys in Input, Textarea fields
            var target = jQuery(element);
            if( target.is("input") || target.is("textarea")){
                return;
            }
        }
        
        var code = event.which,
            type = event.type,
            special = hotkeys.special_keys[code],
            // prevent f5 overlapping with 't' (or f4 with 's', etc.)
            character = !special && String.fromCharCode(code).toLowerCase(),
            shift = event.shiftKey,
            ctrl = event.ctrlKey,            
            // patch for jquery 1.2.5 && 1.2.6 see more at:  
            // http://groups.google.com/group/jquery-en/browse_thread/thread/83e10b3bb1f1c32b
            alt= event.altKey || event.originalEvent.altKey,
            propagate = true, // default behaivour
            mapPoint = null;

        // in opera + safari, the event.target is unpredictable.
        // for example: 'keydown' might be associated with HtmlBodyElement 
        // or the element where you last clicked with your mouse.
        if (jQuery.browser.opera || jQuery.browser.safari || options.checkParent){
            while (!hotkeys.all[element.id] && element.parentNode){
                console.log('checking the parent %s', element.parentNode);
                element = element.parentNode;
            }
        }
        
        // document  element has no id
        var key = (element === document && element) || element.id;
        var cbMap = hotkeys.all[key].events[type].callbackMap;
        
        if(!shift && !ctrl && !alt) { // No Modifiers
            mapPoint = cbMap[special] ||  (character && cbMap[character]);
        }
        else{
            // check combinaitons (alt|ctrl|shift+anything)
            var modif = '';
            if(alt) modif +='alt+';
            if(ctrl) modif+= 'ctrl+';
            if(shift) modif += 'shift+';
            
            // modifiers + special keys or modifiers + characters or modifiers + shift characters
            mapPoint = cbMap[modif+special];
            if (!mapPoint){
                if (character){
                    mapPoint = cbMap[modif+character] || cbMap[modif+hotkeys.shift_nums[character]];
                }
            }
        }
        
        if (mapPoint){
            mapPoint.cb(event);
            if(!mapPoint.propagate) {
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
            else{
                return true;
            }
        }
    };

    hotkeys.add = function(combi, options, callback) {
        if (jQuery.isFunction(options)){
            callback = options;
            options = {};
        }
        var opt = {},
            defaults = {
                type: 'keydown', 
                propagate: false, 
                disableInInput: false, 
                target: document, 
                checkParent: true
            };
                
        opt = jQuery.extend( opt , defaults, options || {} );
        
        combi = combi.toLowerCase();        
        
        // first hook for this element
        if (!hotkeys.all[opt.target]){
            hotkeys.all[opt.target] = {events:{}};
        }
        if (!hotkeys.all[opt.target].events[opt.type]){
            hotkeys.all[opt.target].events[opt.type] = {callbackMap: {}}
            var target = opt.target === document && opt.target || jQuery("#" + opt.target)[0];
            jQuery(target).bind(opt.type, opt, hotkeys.handler);
            //jQuery.event.add(target, opt.type, hotkeys.handler);
        }        
        hotkeys.all[opt.target].events[opt.type].callbackMap[combi] =  {cb: callback, propagate:opt.propagate};                
        return jQuery;
    };
    
    hotkeys.bind = hotkeys.add;
    
    hotkeys.remove = function(exp, opt) {
        opt = opt || {};
        target = opt.target || document;
        type = opt.type || 'keydown';
        exp = exp.toLowerCase();        
        delete hotkeys.all[target].events[type].callbackMap[exp]        
        return jQuery;
    };
    
    jQuery.hotkeys = hotkeys;
    return jQuery;    
    
})(jQuery);
