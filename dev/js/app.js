/* global $ */


function orderAjax(status, orderId) {
    var status = status;
    var csrf = $('#token').attr("value")
    var data = {
        status: status, 
        orderId: orderId,
        csrf: csrf
    }
    $.ajaxSetup({
        headers: {
          'X-CSRF-Token': csrf
        }
      });
    $.ajax({
	    url: '/user/orders/update',
	    type: 'POST',
	    dataType: 'json',
	    data: JSON.stringify(data),
	    contentType: 'application/json',
	    complete: function(data){
                    console.log("Complete")
	    }
	})
}


//Order Buttons

var orderDiv = $('[data-id]');
var orderArr = [...orderDiv];
orderArr.forEach(function(div){
    div.addEventListener('click', checkButton, false);
});

function checkButton(e){
    if(e.target !== e.currentTarget){
        var clickedItem = e.target.id;
        var orderId = $(this).data("id");
        if(clickedItem == "btn-out"){
            orderAjax("out", orderId);
            $('.tag',this).addClass('is-warning').removeClass('is-info is-success is-danger').text('Out');
        }
        if(clickedItem == "btn-pending"){
            orderAjax("pending", orderId);
            $('.tag',this).addClass('is-info').removeClass('is-warning is-success is-danger').text('Pending');
        }
        if(clickedItem == "btn-returned"){
            orderAjax("returned", orderId);
            $('.card-footer', this).remove();
            $(".tag:contains('Late')", this).remove();
            $('.tag',this).addClass('is-success').removeClass('is-warning is-info is-danger').text('Returned');
        }
        if(clickedItem == "btn-cancelled"){
            orderAjax("cancelled", orderId);
            $('.card-footer', this).remove();
            $(".tag:contains('Late')", this).remove();
            $('.tag',this).addClass('is-danger').removeClass('is-warning is-info is-success').text('Cancelled');
        }
    }
    e.stopPropagation();

}



$('#post-comment').on('click', function(e){
  var name = $('#input-name').val()
  var input = $('#input-comment').val()
  commentAjax(name, input)
})


function commentAjax(name, input) {
    var csrf = $('#token').attr("value")
    var data = {
        comment: input, 
        name: name,
        csrf: csrf
    }
    $.ajaxSetup({
        headers: {
          'X-CSRF-Token': csrf
        }
      });
    $.ajax({
	    url: '/user/post',
	    type: 'POST',
	    dataType: 'json',
	    data: JSON.stringify(data),
	    contentType: 'application/json',
	}).done(function(data){
      console.log(data.comment._id)
      $('#comment-box').prepend('<article class="media"><div class="media-content"><div class="content"><p><strong>' 
      + data.comment.name + ': </strong>' 
      + data.comment.comment + ' </p></div></div><div class="media-right"><button class="delete" data-id="' 
      + data.comment._id + '" ></button></div></article>');
      location.reload();
    })
}

$('#comment-delete').on('click', function(e){
  var id = $(this).data("id")
  e.stopPropagation;
  commentDeleteAjax(id)
})


function commentDeleteAjax(id) {
    var csrf = $('#token').attr("value")
    var data = {
        id: id, 
        csrf: csrf
    }
    $.ajaxSetup({
        headers: {
          'X-CSRF-Token': csrf
        }
      });
    $.ajax({
	    url: '/user/post/delete',
	    type: 'POST',
	    dataType: 'json',
	    data: JSON.stringify(data),
	    contentType: 'application/json',
	    success: function (result) {
        if(result.status == 200){
            location.reload();
        }
    },
	})
}


//END Order Buttons


//start ISOTOPE


Isotope.Item.prototype._create = function() {
  // assign id, used for original-order sorting
  this.id = this.layout.itemGUID++;
  // transition objects
  this._transn = {
    ingProperties: {},
    clean: {},
    onEnd: {}
  };
  this.sortData = {};
};

Isotope.Item.prototype.layoutPosition = function() {
  this.emitEvent( 'layout', [ this ] );
};

Isotope.prototype.arrange = function( opts ) {
  // set any options pass
  this.option( opts );
  this._getIsInstant();
  // just filter
  this.filteredItems = this._filter( this.items );
  // flag for initalized
  this._isLayoutInited = true;
};

// layout mode that does not position items
Isotope.LayoutMode.create('none');


// quick search regex
var qsRegex;
var buttonFilter;

var grid = $('.grid').isotope({
  // options
  itemSelector: '.element-item',
  layoutMode: 'vertical',
  filter: function() {
    var $this = $(this);
    var searchResult = qsRegex ? $this.text().match( qsRegex ) : true;
    var buttonResult = buttonFilter ? $this.is( buttonFilter ) : true;
    return searchResult && buttonResult;
  }
});

var $gridIndex = $('.grid-index').isotope({
  // options
  itemSelector: '.element-item-index',
  layoutMode: 'masonry',
  transitionDuration: 0,
  masonry: {
     columnWidth: ".grid-sizer",
  },
  filter: function() {
    var $this = $(this);
    var searchResult = qsRegex ? $this.text().match( qsRegex ) : true;
    var buttonResult = buttonFilter ? $this.is( buttonFilter ) : true;
    return searchResult && buttonResult;
  }
});

//reload grid after images load in order to clear footer
$gridIndex.imagesLoaded().done( function() {
  $('.grid-index').isotope();
});


$('.filters-button-group').on( 'click', 'button', function() {
  buttonFilter = $( this ).attr('data-filter');
  $('.grid').isotope();
});

$('.filters-button-group-index').on( 'click', 'button', function() {
  buttonFilter = $( this ).attr('data-filter');
  $('.grid-index').isotope();
});

$('.filters-button-group-index').on( 'click', 'a', function() {
  buttonFilter = $( this ).attr('data-filter');
  $('.grid-index').isotope();
});



// use value of search field to filter
var $quicksearch = $('.quicksearch').keyup( debounce( function() {
  qsRegex = new RegExp( $quicksearch.val(), 'gi' );
  $('.grid-index').isotope();
  $('.grid').isotope();
}, 200 ) );


// debounce so filtering doesn't happen every millisecond
function debounce( fn, threshold ) {
  var timeout;
  return function debounced() {
    if ( timeout ) {
      clearTimeout( timeout );
    }
    function delayed() {
      fn();
      timeout = null;
    }
    timeout = setTimeout( delayed, threshold || 100 );
  }
}

//end ISOTOPE

//start Active Button handler
var buttons = $(".tabs .button")

buttons.on('click', swapChecked)

function swapChecked(e) {
  buttons.not(this).removeClass('active')
  $(this).addClass('active')
}

//end Active Button handler

$('#modal-delete-button').on('click', function(){
  $('#modal-delete').addClass('is-active')
})

$('.modal-cancel-button').on('click', function(){
  $('#modal-delete').removeClass('is-active')
})

var reserveDateInput = $('#reserve-date')
$('#reserve-checkbox').change(function(){
  if($(this).is(':checked')){
    reserveDateInput.removeClass('hidden')
  } else {
    reserveDateInput.addClass('hidden')
  }
})


$(function(){
  $("img.lazy").lazyload();
  $('#datePick').multiDatesPicker();
})

$(document).ready(function(){                    
  $(window).scroll(function(){                          
      if ($(this).scrollTop() > 400) {
          $('#buttonToTop').fadeIn(250);
      } else {
          $('.buttonToTop').fadeOut(250);
      }
  });
});

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  
    document.body.scrollTop = 0; // For Chrome, Safari and Opera 
    document.documentElement.scrollTop = 0; // For IE and Firefox
}


function closest(el, selector) {
  var matchesFn;

  // find vendor prefix
  [ 'matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector' ].some( function( fn ) {
    if ( typeof document.body[ fn ] == 'function' ) {
      matchesFn = fn;
      return true;
    }
    return false;
  } );

  var parent;

  // traverse parents
  while ( el ) {
      parent = el.parentElement;
      if ( parent && parent[ matchesFn ]( selector ) ) {
        return parent;
      }
      el = parent;
  }

  return null;
}

document.addEventListener( 'DOMContentLoaded', function () {
  // Get all document sliders
  var showQuickview = document.querySelectorAll( '[data-show="quickview"]' );
  [].forEach.call( showQuickview, function ( show ) {
    var quickview = document.getElementById( show.dataset[ 'target' ] );
    if ( quickview ) {
      // Add event listener to update output when slider value change
      show.addEventListener( 'click', function( event ) {
        quickview.classList.add( 'is-active' );
      } );
    }
  } );

  // Get all document sliders
  var dismissQuickView = document.querySelectorAll( '[data-dismiss="quickview"]' );
  [].forEach.call( dismissQuickView, function ( dismiss ) {
    var quickview = closest( dismiss, '.quickview' );
    if ( quickview ) {
      // Add event listener to update output when slider value change
      dismiss.addEventListener( 'click', function( event ) {
        quickview.classList.remove( 'is-active' );
      } );
    }
  } );
} );

// $('.lazy').imagesLoaded().progress( function( instance, image ) {
//     var item = instance.elements[instance.progressedCount];
//     console.log(instance)
//     item.classList.remove("invisible")
    
//   });
		

