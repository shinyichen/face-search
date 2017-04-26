(function () {
    'use strict';

    angular.module('modals', [])

        .component('debugModalComponent', {
            templateUrl: 'debugModal.html',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            },
            controller: function () {
                var $ctrl = this;

                $ctrl.$onInit = function () {
                    $ctrl.original = $ctrl.resolve.params.original;
                    $ctrl.yaw = $ctrl.resolve.params.yaw;
                    $ctrl.face_x = $ctrl.resolve.params.face_x;
                    $ctrl.face_y = $ctrl.resolve.params.face_y;
                    $ctrl.face_width = $ctrl.resolve.params.face_width;
                    $ctrl.face_height = $ctrl.resolve.params.face_height;
                    $ctrl.cropped = $ctrl.resolve.params.cropped;
                    $ctrl.renderedFr = $ctrl.resolve.params.renderedFr;
                    $ctrl.renderedHp = $ctrl.resolve.params.renderedHp;
                    $ctrl.renderedFp = $ctrl.resolve.params.renderedFp;
                    $ctrl.aligned = $ctrl.resolve.params.aligned;
                    $ctrl.landmarks = $ctrl.resolve.params.landmarks;
                    $ctrl.confidence = $ctrl.resolve.params.confidence;
                    $ctrl.landmark_dur = $ctrl.resolve.params.landmark_dur;
                    $ctrl.pose_dur = $ctrl.resolve.params.pose_dur;
                    $ctrl.render_dur = $ctrl.resolve.params.render_dur;
                    $ctrl.align_dur = $ctrl.resolve.params.align_dur;
                    $ctrl.featex_dur = $ctrl.resolve.params.featex_dur;
                    $ctrl.featex_batch_dur = $ctrl.resolve.params.featex_batch_dur;
                };
            }
        })

        .component('selectModalComponent', {
            templateUrl: 'selectModal.html',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            },
            controller: function () {
                var $ctrl = this;

                $ctrl.$onInit = function () {
                    $ctrl.file = $ctrl.resolve.params.file;
                    $ctrl.data = $ctrl.resolve.params.data;
                };

                $ctrl.ok = function (index) {
                    $ctrl.close({$value: index});
                };

                $ctrl.cancel = function () {
                    $ctrl.close({$value: index});
                };
            }
        });
})();