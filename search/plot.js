(function() {

    angular.module('plotModule', ['ui.bootstrap', 'd3'])
        .directive('plot', ['d3Service', '$timeout', function (d3Service, $timeout) {
            return {
                restrict: 'E',
                scope: {
                    imagePath: "@",
                    plotApi: "="
                },
                link: function(scope, element, attrs) {

                    d3Service.d3().then(function(d3) {

                        var w = element[0].parentElement.clientWidth;

                        var h = element[0].offsetParent.clientHeight - element[0].offsetTop - 40;

                        var scaledImageW;

                        var scaledImageH;

                        var drawn = false;

                        var rect = null;

                        var scale = 1;

                        var svg = d3.select(element[0]).append("svg");
                        svg.attr("width", w)
                            .attr("height", h);

                        var g = svg.append("g");

                        // get image size before drawing image
                        var image = new Image();
                        image.src = scope.imagePath;
                        image.onload = function() {
                            var width = this.width;
                            var height = this.height;

                            if (width > w || height > h) {
                                scale = Math.min(w/width, h/height);
                                scaledImageW = width * scale;
                                scaledImageH = height * scale;
                            }
                            var imgs = svg.selectAll("image").data([0]);
                            imgs.enter()
                                .append("svg:image")
                                .attr("xlink:href", scope.imagePath)
                                .attr("width", scaledImageW)
                                .attr("height", scaledImageH);
                        };

                        svg.on("mousedown", function() {
                            if (drawn)
                                return;

                            var e = this;
                            var origin = d3.mouse(e);
                            rect = svg.append("rect").attr("fill-opacity", 0.1).attr("stroke", "black").attr("stroke-width", 1);
                            d3.select(window)
                                .on("mousemove.zoomRect", function() {
                                    var m = d3.mouse(e);
                                    m[0] = Math.max(0, Math.min(scaledImageW, m[0]));
                                    m[1] = Math.max(0, Math.min(scaledImageH, m[1]));
                                    rect.attr("x", Math.min(origin[0], m[0]))
                                        .attr("y", Math.min(origin[1], m[1]))
                                        .attr("width", Math.min(scaledImageW, Math.abs(m[0] - origin[0])))
                                        .attr("height", Math.min(scaledImageH, Math.abs(m[1] - origin[1])));
                                }, true)
                                .on("mouseup.zoomRect", function() {
                                    d3.select(window).on("mousemove.zoomRect", null).on("mouseup.zoomRect", null);
                                    drawn = true;
                                }, true);
                            d3.event.stopImmediatePropagation();
                        });

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