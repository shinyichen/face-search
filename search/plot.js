(function() {

    angular.module('plotModule', ['ui.bootstrap', 'd3'])
        .directive('plot', ['d3Service', '$timeout', function (d3Service) {
            return {
                restrict: 'E',
                scope: {
                    imagePath: "=",
                    plotApi: "="
                },
                link: function(scope, element, attrs) {

                    d3Service.d3().then(function(d3) {

                        // var w = element[0].parentElement.clientWidth;
                        var w = 400;
                        // var h = element[0].offsetParent.clientHeight - element[0].offsetTop - 40;
                        var h = 300;

                        var scaledImageW;

                        var scaledImageH;

                        var drawn = false;

                        var rect = null;

                        var scale = 1;

                        var svg;

                        var image;

                        scope.$watch('imagePath', function(newv, oldv) {
                            if (newv !== oldv) {
                                d3.select("svg").remove();
                                scope.draw();
                            }
                        });

                        scope.draw = function () {

                            svg = d3.select(element[0]).append("svg");
                            drawn = false;
                            rect = null;
                            scaledImageW = 1;
                            scaledImageH = 1;
                            scale = 1;
                            image = null;

                            svg.attr("width", w);
                            svg.attr("height", h);

                            var g = svg.append("g");

                            // get image size before drawing image
                            image = new Image();
                            image.src = scope.imagePath;
                            image.onload = function () {
                                var width = image.width;
                                var height = image.height;

                                if (width > w || height > h) {
                                    scale = Math.min(w / width, h / height);
                                    scaledImageW = width * scale;
                                    scaledImageH = height * scale;
                                } else {
                                    scaledImageW = width;
                                    scaledImageH = height;
                                }
                                var imgs = svg.selectAll("image").data([0]);
                                imgs.enter()
                                    .append("svg:image")
                                    .attr("xlink:href", scope.imagePath)
                                    .attr("width", scaledImageW)
                                    .attr("height", scaledImageH);
                            };

                            svg.on("mousedown", function () {
                                if (drawn) {
                                    rect = null;
                                    svg.select("rect").remove();
                                }

                                var e = this;
                                var origin = d3.mouse(e);
                                rect = svg.append("rect").attr("fill-opacity", 0.1).attr("stroke", "black").attr("stroke-width", 1);
                                d3.select(window)
                                    .on("mousemove.zoomRect", function () {
                                        var m = d3.mouse(e);
                                        m[0] = Math.max(0, Math.min(scaledImageW, m[0]));
                                        m[1] = Math.max(0, Math.min(scaledImageH, m[1]));
                                        rect.attr("x", Math.min(origin[0], m[0]))
                                            .attr("y", Math.min(origin[1], m[1]))
                                            .attr("width", Math.min(scaledImageW, Math.abs(m[0] - origin[0])))
                                            .attr("height", Math.min(scaledImageH, Math.abs(m[1] - origin[1])));
                                    }, true)
                                    .on("mouseup.zoomRect", function () {
                                        d3.select(window).on("mousemove.zoomRect", null).on("mouseup.zoomRect", null);
                                        drawn = true;
                                        scope.$apply();
                                    }, true);
                                d3.event.stopImmediatePropagation();
                            });
                        };

                        scope.draw();

                        scope.plotApi.reset = function() {
                            if (drawn) {
                                rect.remove();
                                drawn = false;
                            }
                        };

                        scope.plotApi.isDrawn = function() {
                            return drawn;
                        };

                        scope.plotApi.getFaceX = function() {
                            if (drawn)
                                return rect.attr("x")/scale;

                        };

                        scope.plotApi.getFaceY = function() {
                            if (drawn)
                                return rect.attr("y")/scale;
                        };

                        scope.plotApi.getFaceWidth = function() {
                            if (drawn)
                            return rect.attr("width")/scale;
                        };

                        scope.plotApi.getFaceHeight = function() {
                            if (drawn)
                            return rect.attr("height")/scale;
                        };

                    });


                }
            }

        }]);
})();