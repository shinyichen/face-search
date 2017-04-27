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
                    $ctrl.uploadDir = $ctrl.resolve.params.uploadDir;
                    $ctrl.files = $ctrl.resolve.params.files;
                    $ctrl.data = $ctrl.resolve.params.data;
                    $ctrl.currentIndex = 0;
                    $ctrl.currentData = $ctrl.data[0];
                };

                var selections = [];

                $ctrl.select = function(i) {
                    selections[$ctrl.currentIndex] = i;
                    if ($ctrl.currentIndex == $ctrl.files.length - 1) {
                        $ctrl.ok(selections);
                    } else {
                        $ctrl.currentIndex += 1;
                        $ctrl.currentData = $ctrl.data[$ctrl.currentIndex];
                    }
                };

                $ctrl.ok = function (selections) {
                    $ctrl.close({$value: selections});
                };

                $ctrl.cancel = function () {
                    for (var i = $ctrl.currentIndex; i < $ctrl.files.length; i++) {
                        $ctrl.selection[i] = 0;
                    }
                    $ctrl.close({$value: selections});
                };
            }
        });
})();