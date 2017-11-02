"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(e){"function"==typeof define&&define.amd?define(["jquery","jquery-ui-dist"],e):e(jQuery)}(function(e){e.extend(e.ui,{multiDatesPicker:{version:"1.6.6"}}),e.fn.multiDatesPicker=function(t){function i(e,t){t||(t="picked"),e=c.call(this,e);for(var i=0;i<this.multiDatesPicker.dates[t].length;i++)if(!u.compareDates(this.multiDatesPicker.dates[t][i],e))return this.multiDatesPicker.dates[t].splice(i,1).pop()}function a(e,t){return t||(t="picked"),this.multiDatesPicker.dates[t].splice(e,1).pop()}function s(e,t,i){t||(t="picked"),(e=c.call(this,e)).setHours(0),e.setMinutes(0),e.setSeconds(0),e.setMilliseconds(0),!1===u.gotDate.call(this,e,t)&&(this.multiDatesPicker.dates[t].push(e),i||this.multiDatesPicker.dates[t].sort(u.compareDates))}function r(e){e||(e="picked"),this.multiDatesPicker.dates[e].sort(u.compareDates)}function c(e,t,i){return t||(t="object"),u.dateConvert.call(this,e,t,i)}var o=arguments,l=this,n=(new Date,new Date(0),{}),u={init:function(t){var i=e(this);this.multiDatesPicker.changed=!1;var a={beforeShow:function(e,t){this.multiDatesPicker.changed=!1,this.multiDatesPicker.originalBeforeShow&&this.multiDatesPicker.originalBeforeShow.call(this,e,t)},onSelect:function(t,i){var a=e(this);if(this.multiDatesPicker.changed=!0,t&&(a.multiDatesPicker("toggleDate",t),this.multiDatesPicker.changed=!0),"normal"==this.multiDatesPicker.mode&&this.multiDatesPicker.pickableRange)if(this.multiDatesPicker.dates.picked.length>0){var s=this.multiDatesPicker.dates.picked[0],r=new Date(s.getTime());if(u.sumDays(r,this.multiDatesPicker.pickableRange-1),this.multiDatesPicker.adjustRangeToDisabled){var c,o=this.multiDatesPicker.dates.disabled.slice(0);do{c=0;for(var l=0;l<o.length;l++)o[l].getTime()<=r.getTime()&&(s.getTime()<=o[l].getTime()&&o[l].getTime()<=r.getTime()&&c++,o.splice(l,1),l--);r.setDate(r.getDate()+c)}while(0!=c)}this.multiDatesPicker.maxDate&&r>this.multiDatesPicker.maxDate&&(r=this.multiDatesPicker.maxDate),a.datepicker("option","minDate",s).datepicker("option","maxDate",r)}else a.datepicker("option","minDate",this.multiDatesPicker.minDate).datepicker("option","maxDate",this.multiDatesPicker.maxDate);this.multiDatesPicker.originalOnSelect&&t&&this.multiDatesPicker.originalOnSelect.call(this,t,i)},beforeShowDay:function(t){var i=e(this),a=!1!==i.multiDatesPicker("gotDate",t),s=i.datepicker("option","disabled"),r=!1!==i.multiDatesPicker("gotDate",t,"disabled"),c=this.multiDatesPicker.maxPicks<=this.multiDatesPicker.dates.picked.length,o=[!0,"",null];return this.multiDatesPicker.originalBeforeShowDay&&(o=this.multiDatesPicker.originalBeforeShowDay.call(this,t)),o[1]=a?"ui-state-highlight "+o[1]:o[1],o[0]=o[0]&&!(s||r||c&&!o[1]),o}};if(i.val())var s=i.val();t?(t.separator&&(this.multiDatesPicker.separator=t.separator),this.multiDatesPicker.separator||(this.multiDatesPicker.separator=", "),this.multiDatesPicker.originalBeforeShow=t.beforeShow,this.multiDatesPicker.originalOnSelect=t.onSelect,this.multiDatesPicker.originalBeforeShowDay=t.beforeShowDay,this.multiDatesPicker.originalOnClose=t.onClose,i.datepicker(t),this.multiDatesPicker.minDate=e.datepicker._determineDate(this,t.minDate,null),this.multiDatesPicker.maxDate=e.datepicker._determineDate(this,t.maxDate,null),t.addDates&&u.addDates.call(this,t.addDates),t.addDisabledDates&&u.addDates.call(this,t.addDisabledDates,"disabled"),u.setMode.call(this,t)):i.datepicker(),i.datepicker("option",a),s&&i.multiDatesPicker("value",s);var r=i.multiDatesPicker("value");i.val(r);var c=i.datepicker("option","altField");c&&e(c).val(r),i.datepicker("refresh")},compareDates:function(e,t){e=c.call(this,e),t=c.call(this,t);var i=e.getFullYear()-t.getFullYear();return i||(i=e.getMonth()-t.getMonth())||(i=e.getDate()-t.getDate()),i},sumDays:function(e,t){var i=void 0===e?"undefined":_typeof(e);return obj_date=c.call(this,e),obj_date.setDate(obj_date.getDate()+t),c.call(this,obj_date,i)},dateConvert:function(t,i,a){var s=void 0===t?"undefined":_typeof(t),r=e(this);if(s==i){if("object"==s)try{t.getTime()}catch(t){return e.error("Received date is in a non supported format!"),!1}return t}if(void 0===t&&(t=new Date(0)),"string"!=i&&"object"!=i&&"number"!=i&&e.error('Date format "'+i+'" not supported!'),!a){var c=r.datepicker("option","dateFormat");a=c||e.datepicker._defaults.dateFormat}switch(s){case"object":break;case"string":t=e.datepicker.parseDate(a,t);break;case"number":t=new Date(t);break;default:e.error('Conversion from "'+s+'" format not allowed on jQuery.multiDatesPicker')}switch(i){case"object":return t;case"string":return e.datepicker.formatDate(a,t);case"number":return t.getTime();default:e.error('Conversion to "'+i+'" format not allowed on jQuery.multiDatesPicker')}return!1},gotDate:function(e,t){t||(t="picked");for(var i=0;i<this.multiDatesPicker.dates[t].length;i++)if(0===u.compareDates.call(this,this.multiDatesPicker.dates[t][i],e))return i;return!1},value:function(e){if(!e||"string"!=typeof e){var t=u.getDates.call(this,"string");return t.length?t.join(this.multiDatesPicker.separator):""}u.addDates.call(this,e.split(this.multiDatesPicker.separator))},getDates:function(t,i){switch(t||(t="string"),i||(i="picked"),t){case"object":return this.multiDatesPicker.dates[i];case"string":case"number":for(var a=[],s=0;s<this.multiDatesPicker.dates[i].length;s++)a.push(c.call(this,this.multiDatesPicker.dates[i][s],t));return a;default:e.error('Format "'+t+'" not supported!')}},addDates:function(t,i){if(t.length>0)switch(i||(i="picked"),void 0===t?"undefined":_typeof(t)){case"object":case"array":if(t.length){for(var a=0;a<t.length;a++)s.call(this,t[a],i,!0);r.call(this,i);break}case"string":case"number":s.call(this,t,i);break;default:e.error('Date format "'+(void 0===t?"undefined":_typeof(t))+'" not allowed on jQuery.multiDatesPicker')}else e.error("Empty array of dates received.")},removeDates:function(e,t){t||(t="picked");var a=[];if("[object Array]"===Object.prototype.toString.call(e)){e.sort(function(e,t){return t-e});for(var s=0;s<e.length;s++)a.push(i.call(this,e[s],t))}else a.push(i.call(this,e,t));return a},removeIndexes:function(e,t){t||(t="picked");var i=[];if("[object Array]"===Object.prototype.toString.call(e)){e.sort(function(e,t){return t-e});for(var s=0;s<e.length;s++)i.push(a.call(this,e[s],t))}else i.push(a.call(this,e,t));return i},resetDates:function(e){e||(e="picked"),this.multiDatesPicker.dates[e]=[]},toggleDate:function(e,t){switch(t||(t="picked"),this.multiDatesPicker.mode){case"daysRange":this.multiDatesPicker.dates[t]=[];var i=this.multiDatesPicker.autoselectRange[1],a=this.multiDatesPicker.autoselectRange[0];i<a&&(i=this.multiDatesPicker.autoselectRange[0],a=this.multiDatesPicker.autoselectRange[1]);for(var s=a;s<i;s++)u.addDates.call(this,u.sumDays.call(this,e,s),t);break;default:!1===u.gotDate.call(this,e)?u.addDates.call(this,e,t):u.removeDates.call(this,e,t)}},setMode:function(t){e(this);switch(t.mode&&(this.multiDatesPicker.mode=t.mode),this.multiDatesPicker.mode){case"normal":for(var i in t)switch(i){case"maxPicks":case"minPicks":case"pickableRange":case"adjustRangeToDisabled":this.multiDatesPicker[i]=t[i]}break;case"daysRange":case"weeksRange":var a=1;for(i in t)switch(i){case"autoselectRange":a--;case"pickableRange":case"adjustRangeToDisabled":this.multiDatesPicker[i]=t[i]}a>0&&e.error("Some mandatory options not specified!")}n.onSelect&&n.onSelect()},destroy:function(){this.multiDatesPicker=null,e(this).datepicker("destroy")}};return this.each(function(){var i=e(this);if(this.multiDatesPicker||(this.multiDatesPicker={dates:{picked:[],disabled:[]},mode:"normal",adjustRangeToDisabled:!0}),u[t]){var a=u[t].apply(this,Array.prototype.slice.call(o,1));switch(t){case"removeDates":case"removeIndexes":case"resetDates":case"toggleDate":case"addDates":var s=i.datepicker("option","altField"),r=u.value.call(this);void 0!==s&&""!=s&&e(s).val(r),i.val(r),e.datepicker._refreshDatepicker(this)}switch(t){case"removeDates":case"getDates":case"gotDate":case"sumDays":case"compareDates":case"dateConvert":case"value":l=a}return a}return"object"!==(void 0===t?"undefined":_typeof(t))&&t?(e.error("Method "+t+" does not exist on jQuery.multiDatesPicker"),!1):u.init.apply(this,o)}),l};var t=(new Date).getTime();e.multiDatesPicker={version:!1},e.multiDatesPicker.initialized=!1,e.multiDatesPicker.uuid=(new Date).getTime(),e.multiDatesPicker.version=e.ui.multiDatesPicker.version,e.multiDatesPicker._hideDatepicker=e.datepicker._hideDatepicker,e.datepicker._hideDatepicker=function(){var t=this._curInst.input[0],i=t.multiDatesPicker;return!i||!1===this._curInst.inline&&!i.changed?e.multiDatesPicker._hideDatepicker.apply(this,arguments):(i.changed=!1,void e.datepicker._refreshDatepicker(t))},window["DP_jQuery_"+t]=e});