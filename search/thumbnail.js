(function () {
    'use strict';

    angular.module('facesearch.thumbnail', [])


        .directive('thumbnail', [function() {

                return {
                    restrict: 'E',
                    template: "<canvas></canvas>",
                    replace: true,
                    scope: {
                        src: '@imgSrc',      // source image path
                        boxX: '=?',       // source image selected area x
                        boxY: '=?',       // source image selected area y
                        boxWidth: '=?',   // source image selected area width
                        boxHeight: '=?',  // source image selected area height
                        displayWidth: '=?',   // max display width
                        displayHeight: '=?',  // max display height
                        box: "=?",       // draw bounding box of selected rectangle and use original image
                        crop: "=?",       // crop the original image to bounding rectangle
                        match: "=?"       // applies when using box option, use different box color depending on match
                    },
                    link: function (scope, element) {

                        scope.boxX = parseInt(scope.boxX);
                        scope.boxY = parseInt(scope.boxY);
                        if (scope.boxWidth)
                            scope.boxWidth = parseInt(scope.boxWidth);
                        if (scope.boxHeight)
                            scope.boxHeight = parseInt(scope.boxHeight);
                        if (scope.displayWidth)
                            scope.displayWidth = parseInt(scope.displayWidth);
                        else
                            scope.displayWidth = window.innerWidth * 0.6;
                        if (scope.displayHeight)
                            scope.displayHeight = parseInt(scope.displayHeight);
                        else scope.displayHeight = window.innerHeight * 0.6;

                        var canvas = element[0];
                        canvas.width = scope.displayWidth;
                        canvas.height = scope.displayHeight;


                        var img = new Image();
                        img.src = scope.src;
                        img.addEventListener("load", function() {
                            var ctx = canvas.getContext('2d');

                            var rx, ry, r, fWidth, fHeight, startX, startY;

                            // if cropping
                            if (scope.crop) {
                                rx = scope.boxWidth / scope.displayWidth;
                                ry = scope.boxHeight / scope.displayHeight;
                                r = Math.max(rx, ry);
                                fWidth = scope.boxWidth/r;   // final thumbnail W
                                fHeight = scope.boxHeight/r; // final thumbnail H
                                startX = (canvas.width - fWidth) / 2;
                                startY = (canvas.height - fHeight) / 2;
                                ctx.drawImage(img, scope.boxX, scope.boxY, scope.boxWidth, scope.boxHeight, startX, startY, fWidth, fHeight);
                            } else {
                                rx = img.naturalWidth / scope.displayWidth;
                                ry = img.naturalHeight / scope.displayHeight;
                                r = Math.max(rx, ry);
                                fWidth = img.naturalWidth / r;   // final thumbnail W
                                fHeight = img.naturalHeight / r; // final thumbnail H
                                startX = (canvas.width - fWidth) / 2;
                                startY = (canvas.height - fHeight) / 2;
                                ctx.drawImage(img, startX, startY, fWidth, fHeight);

                                if (scope.box) {
                                    // draw bounding box
                                    if (scope.match !== undefined) {
                                        if (scope.match)
                                            ctx.strokeStyle = "#5cb85c";
                                        else
                                            ctx.strokeStyle = "#d9534f";
                                    } else {
                                        ctx.strokeStyle = "green";
                                    }

                                    ctx.lineWidth = 1;
                                    ctx.strokeRect(startX + (scope.boxX/r) - 8, startY + (scope.boxY/r) - 8, scope.boxWidth/r + 16, scope.boxHeight/r + 16);
                                }
                            }

                        }, false);
                    }
                };
            }])


})();