/**
 * Created by jinn on 2015/10/21.
 */

(function () {
    $(window).resize(SGIS.Util.throttle(function () {
        var h = $(window).height() - 50;
        $("#main-container").height(h);
    }, 200)).resize();
})();

var init = function () {
    $("#module-menu li").click(function () {
        $(this).siblings().removeClass("active");
        $(this).addClass("active");
    });
};


$(function () {
    init();
});

