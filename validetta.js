/*!
 * Validetta - Client-side form validation jQuery plugin
 * Version: 0.9.0 (16 February 2014)
 * @jQuery Requires: v1.7 or above
 * @Browser Support : ie8 or above, and all modern browsers
 *
 * Examples : http://lab.hasanaydogdu.com/validetta/#examples
 * GitHub Repository : https://github.com/hsnayd/validetta 
 * Lisans: MIT ve GPL
 *  * http://www.opensource.org/licenses/mit-license.php
 *  * http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2013 Hasan Aydoğdu - http://www.hasanaydogdu.com
 *
 * Special Comment : I'm sorry for my english translation errors :)
 */
;( function ( $ ) {
    "use strict";
    /**
     *  Declare variables
     */
    var Validetta = {}, // Plugin Class
        fields = {}, // Current fields/fieldss
        // RegExp for input validate rules
        reg = new RegExp( /^(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equalTo|customReg|remote)\[(\w{1,15})\]/i ),
        // RegExp for mail control method
        // @from ( http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29 )
        regMail = new RegExp( /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/ ),
        //RegExp for input number control method
        regNumber = new RegExp( /^[\-\+]?\d+\.?\d+$/ ),
    /**
     *  Form validate error messages
     */
    messages = {
        empty     : 'This field is required. Please be sure to check.',
        email     : 'Your E-mail address appears to be invalid. Please be sure to check.',
        number    : 'You can enter only numbers in this field.',
        maxLength : 'Maximum {count} characters allowed!',
        minLength : 'Minimum {count} characters allowed!',
        checkbox  : 'This checkbox is required. Please be sure to check.',
        maxChecked  : 'Maximum {count} options allowed. Please be sure to check.',
        minChecked  : 'Please select minimum {count} options.',
        selectbox   : 'Please select an option.',
        maxSelected : 'Maximum {count} selection allowed. Please be sure to check.',
        minSelected : 'Minimum {count} selection allowed. Please be sure to check.',
        notEqual    : 'Fields do not match. Please be sure to check.',
        creditCard  : 'Invalid credit card number. Please be sure to check.'
    },

    /**
     *  Plugin defaults
     */
    defaults = {
        // Error Template : <span class="errorTemplateClass">Error messages will be here !</span>
        display : 'bubble', // Error display options, // bubble / inline
        errorTemplateClass : 'validetta-bubble', // Class of the element that would receive error message
        errorClass : 'validetta-error', // Class that would be added on every failing validation field
        validClass : 'validetta-valid', // Same for valid validation
        errorClose : true, // Error windows close button. if you want to active it, set is true
        errorCloseClass : 'validetta-bubbleClose', // The html class that will add on element of HTML which is closing the error message window
        realTime : false, // To enable real-time form control, set this option true.
        onValid : function(){}, // This function to be called when the user submits the form and there is no error.
        onError : function(){}, // This function to be called when the user submits the form and there are some errors
        customReg : {}, // Costum reg method variable
        remote : {}
    },

    /**
     * Clears the left and right spaces of given parameter.
     * This is the function for string parameter !
     * If parameter is an array, function will return the parameter without trimed
     *
     * @param {string} value
     * @return {mixed}
     */
    trim = function( value ){
       return typeof value === 'string' ? value.replace( /^\s+|\s+$/g, '' ) : value;
    },

    /**
     * Validator
     * {count} which used below is the specified maximum or minimum value
     * e.g if method is minLength and  rule is 2 ( minLength[2] ) 
     * Output error windows text will be : 'Please select minimum 2 options.'
     *
     * @namespace
     * @param {object} tmp = this.tmp Tmp object for store current field and its value
     * @param {String} tmp : input value
     */
    Validator = {
        required : function( tmp, that ){
            switch ( tmp.el.getAttribute( 'type' ) || tmp.el.tagName ){
                case 'checkbox' : return this.checked( tmp.el ) || messages.checkbox;
                case 'radio' : return this.radio.call( that, tmp.el ) || messages.empty;
                case 'SELECT' : return this.selected( tmp.val ) || messages.selectbox;
                default : return this.empty( tmp.val ) || messages.empty;
            }
        },
        // Empty check - it checks the value if it's empty or not
        empty : function( val ){
            return val !== '';
        },
        //  Mail check - it checks the value if it's a valid email address or not
        email : function( tmp ){
            return  tmp.val === '' || regMail.test( tmp.val ) || messages.email;
        },
        // Number check
        number : function( tmp ){
            return tmp.val === '' || regNumber.test( tmp.val ) || messages.number;
        },
        // Minimum length check
        minLength : function( tmp ){
            var _length = tmp.val.length;
            return _length === 0 || _length >= tmp.arg || messages.minLength.replace( '{count}', tmp.arg );
        },
        // Maximum lenght check
        maxLength : function( tmp ){
            return tmp.val.length <= tmp.arg || messages.maxLength.replace( '{count}', tmp.arg );
        },
        // equalTo check
        equalTo : function( tmp, that ){
            return $( that.form ).find( 'input[name="'+ tmp.arg +'"]' ).val() === tmp.val || messages.notEqual;
        },
        /**  
         * Credit Card Control
         * @from : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers
         */
        creditCard : function( tmp ){
            if ( tmp.val === '' ) return true; // allow empty because empty check does by required metheod
            var reg, cardNumber, pos, digit, i, sub_total, sum = 0, strlen;
            reg = new RegExp( /[^0-9]+/g );
            cardNumber = tmp.val.replace( reg, '' );
            strlen = cardNumber.length;
            if( strlen < 16 ) return messages.creditCard;
            for( i=0 ; i < strlen ; i++ ){
                pos = strlen - i;
                digit = parseInt( cardNumber.substring( pos - 1, pos ), 10 );
                if( i % 2 === 1 ){
                    sub_total = digit * 2 ;
                    if( sub_total > 9 ){
                        sub_total = 1 + ( sub_total - 10 );
                    }
                } else {
                    sub_total = digit ;
                }
                sum += sub_total ;
            }
            if( sum > 0 && sum % 10 === 0 ) return true;
            return messages.creditCard;
        },
        //Checkbox check
        checked : function( val ){
            return val.checked;
        },
        maxChecked : function( tmp, that ){
            var cont = $( that.form.querySelectorAll( 'input[type=checkbox][name="'+ tmp.el.name +'"]' ) );
            // we dont want to open an error window for all checkboxes which have same "name"
            if ( cont.index( tmp.el ) !== 0 ) return true;
            var count =  cont.filter( ':checked' ).length ;
            return count <= tmp.arg || messages.maxSelected.replace( '{count}', tmp.arg );
        },
        minChecked : function( tmp, that ){
            var cont = $( that.form.querySelectorAll( 'input[type=checkbox][name="'+ tmp.el.name +'"]' ) );
            if ( cont.index( tmp.el ) !== 0 ) return true; // same as above
            var count =  cont.filter( ':checked' ).length ;
            return count >= tmp.arg || messages.minChecked.replace( '{count}', tmp.arg );
        },
        //Selectbox check
        selected : function( val ){
            return val !== null && val !== '';
        },
        maxSelected : function( tmp ){
            return tmp.val === null || tmp.val === '' || tmp.val.length <= tmp.arg || messages.maxSelected.replace( '{count}', tmp.arg );
        },
        minSelected : function( tmp ){
            return tmp.val === null || tmp.val === '' || tmp.val.length >= tmp.arg || messages.minSelected.replace( '{count}', tmp.arg );
        },
        // Radio
        radio : function ( el ) {
            var count = $( this.form.querySelectorAll( 'input[type=radio][name="'+ el.name +'"]' ) ).filter( ':checked' ).length ;
            return count === 1;
        },
        // Custom reg check
        customReg : function( tmp, that ){
            var arg = that.options.customReg[ tmp.arg ],
                _reg = new RegExp(  arg.method );
            return tmp.val === '' || _reg.test( tmp.val ) || arg.errorMessage;
        },
        remote : function( tmp ){
            tmp.remote = tmp.arg;
            return true;
        }
    };

    /**
     * Plugin Class
     *
     * @constructor
     * @param {object} form : <form> element which being controlled
     * @param {object} options : User-specified settings
     * @return {method} events
     */
    Validetta = function( form, options ){
        /**
         *  Public  Properties
         *  @property {mixed} handler It is used to stop or resume submit event handler
         *  @property {object} options Property is stored in plugin options
         *  @property {object} xhr Stores xhr requests
         *  @property {object} form Property is stored in <form> element
         */
        this.handler = false;
        this.options = $.extend( true, {}, defaults, options );
        this.form = form;
        this.xhr = {};
        this.events();
    };

    Validetta.prototype = {

        constructor : Validetta,

        /**
         * This is the method of handling events
         * 
         * @return {mixed}
         */
        events : function(){
            var that = this; // stored this
            // Handle submit event
            $( this.form ).submit( function( e ){
                // fields to be controlled transferred to global variable
                fields = this.querySelectorAll( '[data-validetta]' );
                return that.init( e );
            });
            // real-time option control
            if( this.options.realTime === true ){
                // handle change event for form elements (without checkbox)
                $( this.form ).find( '[data-validetta]' ).not( '[type=checkbox]' ).on( 'change', function( e ){
                    // field to be controlled transferred to global variable
                    fields = $( this );
                    return that.init( e );
                });
                // handle click event for checkboxes
                $( this.form ).find( '[data-validetta][type=checkbox]' ).on( 'click', function( e ){
                    // fields to be controlled transferred to global variable
                    fields = that.form.querySelectorAll( '[data-validetta][type=checkbox][name="'+ this.name +'"]' );
                    return that.init( e );
                });
            }
            // handle <form> reset button to clear error messages
            $( this.form ).on( 'reset', function(){
                $( that.form.querySelectorAll( '.'+that.options.errorClass+', .'+that.options.validClass ) )
                    .removeClass( that.options.errorClass+' '+that.options.validClass );
                return that.reset();
            });
            // Error close button is active ?
            if( this.options.errorClose ) {
                // error messages manually cleaning function
                // handle error close button to manually clearing error messages
                $( this.form ).on( 'click', '.'+this.options.errorCloseClass, function(){
                    // We're checking the parent value of clicked element to avoid getting error
                    // if parent value is true, clear error window
                    var _errProp = this.parentNode;
                    if( _errProp ) that.window.close.call( that, _errProp );
                    return false;
                });
            }
        },

        /**
         * In this method, fields are validated
         * 
         * @params {object} e : event object
         * @return {mixed}
         */
        init : function( e ){
            // Reset error windows from all elements
            this.reset( fields );
            // Start control each elements
            this.checkFields( e );
            if( e.type !== 'submit' ) return; // if event type is not submit, break
            // This is for when running remote request, return false and wait request response
            else if ( this.handler === 'pending' ) return false;
            // if event type is submit and handler is true, break submit and call onError() function
            else if( this.handler === true ){ this.options.onError.call( this, e ); return false; }
            else return this.options.onValid.call( this, e ); // if form is valid call onValid() function
        },

        /**
         * Checks Fields
         * 
         * @param  {object} e event object
         * @return {void}
         */
        checkFields : function( e ){

            var that = this; // stored this

            for ( var i = fields.length - 1; i >= 0; i-- ) {

                var el = fields[i], //current field
                    errors = '', //current field's errors
                    val = trim ( $( el ).val() ), //current field's value
                    methods = el.getAttribute( 'data-validetta' ).split( ',' ); //current field's control methods
                // Create tmp
                this.tmp = {};
                // store el and val variables in tmp
                this.tmp = { el : el, val : val };

                // Start to check fields
                // Validator : Fields Control Object
                for ( var j = methods.length - 1; j >= 0; j-- ) {
                    // Check Rule
                    var rule = methods[j].match( reg ),
                        method;
                    // Does it have rule?
                    if( rule !== null ){
                        // Does it hava argument ? 
                        if( typeof rule[2] !== 'undefined' ) this.tmp.arg = rule[2];
                        // Set method name
                        method = rule[1];
                    } else { method = methods[j]; }
                    // Is there a methot in Validator ?
                    if( Validator.hasOwnProperty( method ) ) {
                        // Validator returns error message if method invalid
                        var _check = Validator[ method ]( that.tmp, that );
                        if ( _check !== true ) errors += _check+'<br/>';
                    }
                }
                // Check the errors
                if( errors !== '' ){
                    // if parent element has valid class, remove and add error class
                    this.addErrorClass( el );
                    // open error window
                    this.window.open.call( this , el, errors );
                // Check remote validation
                } else if ( typeof this.tmp.remote !== 'undefined' ) {
                    this.checkRemote( el, e );
                } else { // Nice, there are no error
                    this.addValidClass( el );
                }
            }
        },

        /**
         * Checks remote validations
         *
         * @param  {object} el current field
         * @param  {object} e event object
         * @throws {error} If previous remote request for same value has rejected
         * @return {void}
         */
        checkRemote : function( el, e ){
            var ajaxOptions = {},
                data = {},
                fieldName = el.name || el.getAttribute('id');

            if ( typeof this.remoteCache === 'undefined' ) this.remoteCache = {};

            data[ fieldName ] = this.tmp.val; // Set data

            ajaxOptions = $.extend( true, {}, { // exends ajax options
                data: data
            }, this.options.remote[this.tmp.remote] || {} );

            // use $.param() function for generate specific cache key
            var cacheKey = $.param( ajaxOptions );

            // Check cache
            var cache = this.remoteCache[ cacheKey ];

            if ( typeof cache !== 'undefined' ) {
                switch( cache.state ){
                    case 'pending' : // pending means remote request not finished yet
                        this.handler = 'pending'; // update handler and cache event type
                        cache.event = e.type;
                        break;
                    case 'rejected' : // rejected means remote request could not be performed
                        e.preventDefault(); // we have to break submit because of throw error
                        throw new Error( cache.result.message );
                    case 'resolved' : // resolved means remote request has done
                        // Check to cache, if result is invalid, open an error window
                        if ( cache.result.valid === false ) {
                            this.addErrorClass( el );
                            this.window.open.call( this, el, cache.result.message );
                        } else {
                            this.addValidClass( el );
                        }
                        break;
                }
            } else {
                // Abort if previous ajax request still running
                var _xhr = this.xhr[ fieldName ];
                if ( typeof _xhr !== 'undefined' && _xhr.state() === 'pending' ) _xhr.abort();
                // Start caching
                cache = this.remoteCache[ cacheKey ] = { state : 'pending', event : e.type };
                // make a remote request
                this.remoteRequest( ajaxOptions, cache, el, fieldName );
            }
        },
 
        /**
         * Calls ajax request for remote validations
         *
         * @param  {object} ajaxOptions Ajax options
         * @param  {object} cache Cache object
         * @param  {object} inp processing element
         * @param  {string} fieldName Field name for make specific caching
         * @param  {object} e Event object
         */
        remoteRequest : function( ajaxOptions, cache, inp, fieldName, e ){

            var that = this;

            $( inp.parentNode ).addClass('validetta-pending');

            // cache xhr
            this.xhr[ fieldName ] = $.ajax( ajaxOptions )
                .done( function( result ){
                    result = JSON.parse( result );
                    cache.state = 'resolved';
                    cache.result = result;
                    if ( cache.event === 'submit' ) {
                        that.handler = false;
                        $(that.form).trigger('submit');
                    }
                    else if( result.valid === false ) {
                        that.addErrorClass( inp );
                        that.window.open.call( that, inp, result.message );
                    } else {
                        that.addValidClass( inp );
                    }
                } )
                .fail( function( jqXHR, textStatus ){
                    if ( textStatus !== 'abort') { // Dont throw error if request is aborted
                        var _msg = 'Ajax request failed for field ('+fieldName+') : '+jqXHR.status+' '+jqXHR.statusText;
                        cache.state = 'rejected';
                        cache.result = { valid : false, message : _msg };
                        throw new Error( _msg );
                    }
                } )
                .always( function( result ){ $( inp.parentNode ).removeClass('validetta-pending'); } );

            this.handler = 'pending';
        },

        /**
         * This the section which opening or closing error windows process is done
         * 
         * @namespace
         */
        window : {
            /**
             * Error window opens
             * 
             * @params el{object} : element which has an error ( it can be native element or jQuery object )
             * @params error : error message
             */
            open : function( el, error ){
                var elParent = el.parentNode ;
                // If the parent element undefined, that means el is an object. So we need to transform to the element
                if( typeof elParent === 'undefined' ) elParent = el[0].parentNode;
                // if there is an error window which previously opened for el, return
                if( $( elParent ).find( '.'+this.options.errorTemplateClass ).length > 0 ) return;
                // Create the error window object which will be appear
                var errorObject = document.createElement( 'span' );
                errorObject.className = this.options.errorTemplateClass;
                // if error display is bubble, calculate to positions
                if( this.options.display === 'bubble' ){
                    var pos, W, H, T;
                    // !! Here, JQuery functions are using to support the IE8
                    pos = $( el ).position();
                    W = $( el ).width();
                    H = $( el ).height();
                    T= pos.top ;
                    $( errorObject ).empty().css({
                        'left':pos.left+W+30+'px',
                        'top' :T+'px'
                    });
                }
                elParent.appendChild( errorObject );
                errorObject.innerHTML = error ;
                // if errorClose is activated, create the element which use to close the error window
                if( this.options.errorClose ){
                    var errorCloseObject = document.createElement( 'span' );
                    errorCloseObject.innerHTML = 'x';
                    errorCloseObject.className = this.options.errorCloseClass ;
                    errorObject.appendChild( errorCloseObject );
                }
                // we have an error so we need to break submit
                // set to handler true
                this.handler = true;
            },
            /**
             * Error window closes
             * 
             * @params el : the error message window which will be disappear
             */
            close : function( el ){
                el.parentNode.removeChild( el );
                // set to handler false
                // otherwise at the next validation attempt, submit will not continue even the validation is successful
                this.handler = false ;
            }
        },


        /**
         * Removes all error messages windows
         * 
         * @param {object} or {void} el : form elements which have an error message window
         */
        reset : function( el ){
            var _errorMessages = {} ;
            // if el is undefined ( This is the process of resetting all <form> )
            // or el is an object that has element more than one
            // and these elements are not checkbox
            if( typeof el === 'undefined' || ( el.length > 1 && el[0].getAttribute( 'type' ) !== 'checkbox' ) ){
                _errorMessages = $( this.form ).find( '.'+ this.options.errorTemplateClass );
            }
            else {
                _errorMessages = $( el[0].parentNode ).find( '.'+this.options.errorTemplateClass );
            }
            for ( var i = _errorMessages.length -1; i >= 0; i-- ){
                this.window.close.call( this, _errorMessages[i] );
            }
        },

        /**
         * Adds error class and removes valid class if exist
         *
         * @param {object} inp element
         */
        addErrorClass : function( inp ){
            $( inp.parentNode ).removeClass( this.options.validClass ).addClass( this.options.errorClass );
        },

        /**
         * Adds valid class and removes error class if exist
         * if error class not exist, do not add valid class
         *
         * @param {object} inp element
         */
        addValidClass : function( inp ){
            // if parent elemenet has error class, remove and add valid class
            var _parent = inp.parentNode;
            if( $( _parent ).hasClass( this.options.errorClass ) ) {
                $( _parent ).removeClass( this.options.errorClass ).addClass( this.options.validClass );
            }
        }
    };

    /**
     * Plugin Validetta
     * 
     * @param {object} options : User-specified settings
     * @return {object} this
     */
    $.fn.validetta = function (options){
        if( $.validettaLanguage ){
            messages = $.extend( true, {}, messages, $.validettaLanguage.messages );
        }
        return this.each( function(){
            new Validetta( this, options );
        });
    };
})( jQuery );