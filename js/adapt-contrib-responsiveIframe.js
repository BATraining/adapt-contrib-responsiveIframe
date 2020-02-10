/*
* adapt-contrib-responsiveIframe
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Corry <kevinc@learningpool.com>
*/
define(function(require) {

    var ComponentView = require("coreViews/componentView");
    var Adapt = require("coreJS/adapt");

    var ResponsiveIframe = ComponentView.extend({

        events: {
            'inview': 'onInview'
        },

        initialize: function() {
            ComponentView.prototype.initialize.apply(this, []);
            this.setupEvents();
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:changed', this.resizeControl);
        },
        
        postRender: function() {
            var that = this;

            this.$('.responsiveIframe-iframe').ready(function() {
                that.resizeControl(Adapt.device.screenSize);
                that.setReadyStatus();
            });
            
            this.$('.responsiveIframe-iframe').load(function () {
                that.resizeControl(Adapt.device.screenSize);
                that.isInteraction = this.contentWindow.ActionCompletion ? true : false;
            });
            //listen for the ifarme actions complation.
            this.$('.responsiveIframe-iframe').on('completion:status', _.bind(this.iframeEventCompletion, this));
        },

        setupEvents: function() {
            Adapt.on('responsiveIframe::load', this.load.bind(this));
            Adapt.on('responsiveIframe::unloadAll', this.unload.bind(this));
        },

        load: function(id) {
            if (this.model.get('_parentId') == id) {
                this.model.set('_lazy_loading', false);
                this.render();
            }
        },

        unload: function(id) {
            if (this.model.get('_parentId') != id) {
                this.model.set('_lazy_loading', true);
                this.render();
            }
        },

        onInview: function(event, visible, visiblePartX, visiblePartY) {
            if (!this.isInteraction) {
                if (visible) {
                    if (visiblePartY === 'top') {
                        this._isVisibleTop = true;
                    } else if (visiblePartY === 'bottom') {
                        this._isVisibleBottom = true;
                    } else {
                        this._isVisibleTop = true;
                        this._isVisibleBottom = true;
                    }

                    if (this._isVisibleTop && this._isVisibleBottom) {
                        this.$('.component-widget').off('inview');

                        if (Adapt.articles.models[0].get("_horizontalBlockSlider") == "undefined") {
                            this.setCompletionStatus();
                        }
                    }
                }
            }
        },

        iframeEventCompletion: function(event, complationStatus) {
            if (complationStatus) {
                this.setCompletionStatus();
            }

        },

        resizeControl: function(size) {
            var width = this.$('.responsiveIframe-iframe').attr('data-width-' + size);
            var height = this.$('.responsiveIframe-iframe').attr('data-height-' + size);
            this.$('.responsiveIframe-iframe').width(width);
            this.$('.responsiveIframe-iframe').height(height);
        }

    });

    Adapt.register("responsiveIframe", ResponsiveIframe);

});
