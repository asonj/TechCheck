"use strict";function _toConsumableArray(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function orderAjax(t,e){var t=t,n=$("#token").attr("value"),o={status:t,orderId:e,csrf:n};$.ajaxSetup({headers:{"X-CSRF-Token":n}}),$.ajax({url:"/user/orders/update",type:"POST",dataType:"json",data:JSON.stringify(o),contentType:"application/json",complete:function(t){console.log("Complete")}})}function checkButton(t){if(t.target!==t.currentTarget){var e=t.target.id,n=$(this).data("id");"btn-out"==e&&(orderAjax("out",n),$(".tag",this).addClass("is-warning").removeClass("is-info is-success is-danger").text("Out")),"btn-pending"==e&&(orderAjax("pending",n),$(".tag",this).addClass("is-info").removeClass("is-warning is-success is-danger").text("Pending")),"btn-returned"==e&&(orderAjax("returned",n),$(".card-footer",this).remove(),$(".tag:contains('Late')",this).remove(),$(".tag",this).addClass("is-success").removeClass("is-warning is-info is-danger").text("Returned")),"btn-cancelled"==e&&(orderAjax("cancelled",n),$(".card-footer",this).remove(),$(".tag:contains('Late')",this).remove(),$(".tag",this).addClass("is-danger").removeClass("is-warning is-info is-success").text("Cancelled"))}t.stopPropagation()}function commentAjax(t,e){var n=$("#token").attr("value"),o={comment:e,name:t,csrf:n};$.ajaxSetup({headers:{"X-CSRF-Token":n}}),$.ajax({url:"/user/post",type:"POST",dataType:"json",data:JSON.stringify(o),contentType:"application/json"}).done(function(t){console.log(t.comment._id),$("#comment-box").prepend('<article class="media"><div class="media-content"><div class="content"><p><strong>'+t.comment.name+": </strong>"+t.comment.comment+' </p></div></div><div class="media-right"><button class="delete" data-id="'+t.comment._id+'" ></button></div></article>'),location.reload()})}function commentDeleteAjax(t){var e=$("#token").attr("value"),n={id:t,csrf:e};$.ajaxSetup({headers:{"X-CSRF-Token":e}}),$.ajax({url:"/user/post/delete",type:"POST",dataType:"json",data:JSON.stringify(n),contentType:"application/json",success:function(t){200==t.status&&location.reload()}})}function debounce(t,e){var n;return function(){n&&clearTimeout(n),n=setTimeout(function(){t(),n=null},e||100)}}function swapChecked(t){buttons.not(this).removeClass("active"),$(this).addClass("active")}function topFunction(){document.body.scrollTop=0,document.documentElement.scrollTop=0}function closest(t,e){var n;["matches","webkitMatchesSelector","mozMatchesSelector","msMatchesSelector","oMatchesSelector"].some(function(t){return"function"==typeof document.body[t]&&(n=t,!0)});for(var o;t;){if((o=t.parentElement)&&o[n](e))return o;t=o}return null}var orderDiv=$("[data-id]"),orderArr=[].concat(_toConsumableArray(orderDiv));orderArr.forEach(function(t){t.addEventListener("click",checkButton,!1)}),$("#post-comment").on("click",function(t){commentAjax($("#input-name").val(),$("#input-comment").val())}),$("#comment-delete").on("click",function(t){var e=$(this).data("id");t.stopPropagation,commentDeleteAjax(e)}),Isotope.Item.prototype._create=function(){this.id=this.layout.itemGUID++,this._transn={ingProperties:{},clean:{},onEnd:{}},this.sortData={}},Isotope.Item.prototype.layoutPosition=function(){this.emitEvent("layout",[this])},Isotope.prototype.arrange=function(t){this.option(t),this._getIsInstant(),this.filteredItems=this._filter(this.items),this._isLayoutInited=!0},Isotope.LayoutMode.create("none");var qsRegex,buttonFilter,grid=$(".grid").isotope({itemSelector:".element-item",layoutMode:"vertical",filter:function(){var t=$(this),e=!qsRegex||t.text().match(qsRegex),n=!buttonFilter||t.is(buttonFilter);return e&&n}}),$gridIndex=$(".grid-index").isotope({itemSelector:".element-item-index",layoutMode:"masonry",transitionDuration:0,masonry:{columnWidth:".grid-sizer"},filter:function(){var t=$(this),e=!qsRegex||t.text().match(qsRegex),n=!buttonFilter||t.is(buttonFilter);return e&&n}});$gridIndex.imagesLoaded().done(function(){$(".grid-index").isotope()}),$(".filters-button-group").on("click","button",function(){buttonFilter=$(this).attr("data-filter"),$(".grid").isotope()}),$(".filters-button-group-index").on("click","button",function(){buttonFilter=$(this).attr("data-filter"),$(".grid-index").isotope()}),$(".filters-button-group-index").on("click","a",function(){buttonFilter=$(this).attr("data-filter"),$(".grid-index").isotope()});var $quicksearch=$(".quicksearch").keyup(debounce(function(){qsRegex=new RegExp($quicksearch.val(),"gi"),$(".grid-index").isotope(),$(".grid").isotope()},200)),buttons=$(".tabs .button");buttons.on("click",swapChecked),$("#modal-delete-button").on("click",function(){$("#modal-delete").addClass("is-active")}),$(".modal-cancel-button").on("click",function(){$("#modal-delete").removeClass("is-active")});var reserveDateInput=$("#reserve-date");$("#reserve-checkbox").change(function(){$(this).is(":checked")?reserveDateInput.removeClass("hidden"):reserveDateInput.addClass("hidden")}),$(function(){$("img.lazy").lazyload(),$("#datePick").multiDatesPicker()}),$(document).ready(function(){$(window).scroll(function(){$(this).scrollTop()>400?$("#buttonToTop").fadeIn(250):$(".buttonToTop").fadeOut(250)})}),document.addEventListener("DOMContentLoaded",function(){var t=document.querySelectorAll('[data-show="quickview"]');[].forEach.call(t,function(t){var e=document.getElementById(t.dataset.target);e&&t.addEventListener("click",function(t){e.classList.add("is-active")})});var e=document.querySelectorAll('[data-dismiss="quickview"]');[].forEach.call(e,function(t){var e=closest(t,".quickview");e&&t.addEventListener("click",function(t){e.classList.remove("is-active")})})});