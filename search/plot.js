(function() {

    angular.module('plotModule', ['ui.bootstrap', 'd3'])
        .directive('plot', ['d3Service', function (d3Service) {
            return {
                restrict: 'E',
                scope: {
                    imagePath: "=",
                    plotApi: "="
                },
                link: function(scope, element, attrs) {

                    d3Service.d3().then(function(d3) {

                        var w = (window.innerWidth/12)*9, h = window.innerHeight-150, padding = 50, transform = d3.zoomIdentity;

                        var drawn = false;

                        var rect = null;

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
                                var scale = Math.min(w/width, h/height);
                                width = width * scale;
                                height = height * scale;
                            }
                            var imgs = svg.selectAll("image").data([0]);
                            imgs.enter()
                                .append("svg:image")
                                .attr("xlink:href", scope.imagePath)
                                .attr("width", width)
                                .attr("height", height);
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
                                    m[0] = Math.max(0, Math.min(w, m[0]));
                                    m[1] = Math.max(0, Math.min(h, m[1]));
                                    rect.attr("x", Math.min(origin[0], m[0]))
                                        .attr("y", Math.min(origin[1], m[1]))
                                        .attr("width", Math.abs(m[0] - origin[0]))
                                        .attr("height", Math.abs(m[1] - origin[1]));
                                }, true)
                                .on("mouseup.zoomRect", function() {
                                    d3.select(window).on("mousemove.zoomRect", null).on("mouseup.zoomRect", null);
                                    var m = d3.mouse(e);
                                    m[0] = Math.max(0, Math.min(w, m[0]));
                                    m[1] = Math.max(0, Math.min(h, m[1]));
                                    if (m[0] !== origin[0] && m[1] !== origin[1]) {
                                        var T = d3.zoomTransform(svg.node()); // current transform
                                        var dx = Math.abs(m[0] - origin[0])/ T.k;
                                        var dy = Math.abs(m[1] - origin[1])/ T.k;
                                        var s = 1 / Math.max(dx/w, dy/h);
                                        var x = ((m[0]+origin[0])/2 - T.x)/ T.k; // new center
                                        var y = ((m[1]+origin[1])/2 - T.y)/ T.k;
                                        x = x * s; // new center with new scale
                                        y = y * s;
                                        var tx = w/2 - x;
                                        var ty = h/2 - y;

                                        //var t = d3.zoomIdentity.translate(tx, ty).scale(s);
                                        //svg.transition().duration(750).call(zoom.transform, t);
                                    }
                                    //rect.remove();
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
                                return rect.attr("x");

                        };

                        scope.plotApi.getFaceY = function() {
                            if (drawn)
                                return rect.attr("y");
                        };

                        scope.plotApi.getFaceWidth = function() {
                            if (drawn)
                            return rect.attr("width");
                        };

                        scope.plotApi.getFaceHeight = function() {
                            if (drawn)
                            return rect.attr("height");
                        };

                    });


                }
            }

        }]);
})();