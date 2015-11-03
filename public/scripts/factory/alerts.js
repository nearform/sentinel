angular.module( 'sbAdminApp' ).factory('PopdownAPI', function() {
    return {
        status: null,
        message: null,
        success: function(msg) {
            this.status = 'success';
            this.icon = 'check';
            this.message = msg;
        },
        error: function(msg) {
            this.status = 'danger';
            this.icon = 'ban';
            this.message = msg;
        },
        info: function(msg) {
            this.status = 'info';
            this.icon = 'info';
            this.message = msg;
        },
        warning: function(msg) {
            this.status = 'warning';
            this.icon = 'warning';
            this.message = msg;
        },
        clear: function() {
            this.status = null;
            this.icon = null;
            this.message = null;
        }
    }
});