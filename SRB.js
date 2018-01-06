function decodeStats(response, price) {
    if (response == null) return null;

    var result = response.result;
    if (result == null || result.length == null) return null;

    var weiPerEther = new BigNumber("1000000000000000000", 10);

    var totalContributionExact = new BigNumber(result.substr(2, 64), 16).div(weiPerEther);
    var totalContributionUSDExact = totalContributionExact.times(new BigNumber(price));

    return {
        totalContribution: totalContributionExact.round(3, BigNumber.ROUND_DOWN),
        totalContributionUSD: totalContributionUSDExact,    
        totalContributionBeets: totalContributionUSDExact.div(new BigNumber("2")).round(0, BigNumber.ROUND_DOWN),
        totalSupply: new BigNumber(result.substr(66, 64), 16).div(weiPerEther).round(3, BigNumber.ROUND_DOWN),
    };
}

function getStats(price) {
    var url = "https://api.etherscan.io/api?module=proxy&action=eth_call&to=0x173905A75a0244fcb20DB32DbaCfAdD3996CC702&data=0xc59d48470000000000000000000000000000000000000000000000000000000000000000&tag=latest";    
    return $.ajax(url, {
        cache: false,
        dataType: "json"
    }).then(function (data) { return decodeStats(data, price); });
}

function getPrice() {
    var url = "https://api.etherscan.io/api?module=stats&action=ethprice";
    return $.ajax(url, {
        cache: false,
        dataType: "json"
    }).then(function (data) {
        if (data == null) return 1000;
        if (data.result == null) return 1000;
        if (data.result.ethusd == null) return 1000;

        return parseFloat(data.result.ethusd);
    });
}

function updatePage(stats) {
    console.log(stats);
    if (stats == null) return;

    console.log(stats.totalContribution.toNumber());
    $("#total-ether").text(stats.totalContribution.toFixed(3));
    if (stats.totalContribution.toNumber() <= 0) {
        $("#total-ether-message").text("I stopped caring a long time ago.");
    } else {
        $("#total-ether-message").text("I’ve been involved in a number of cults both as a leader and a follower. You have more fun as a follower but you make more money as a leader.");
    }

    $("#total-usd").text("$" + stats.totalContributionUSD.toFixed(0));
    if (stats.totalContributionUSD.toNumber() <= 0) {
        $("#total-usd-message").text("No Ether yet, so no cash either.");
    } else if (stats.totalContributionBeets.toNumber() < 1) {
        $("#total-usd-message").text("Not enough to buy a beet yet.");
    }else if (stats.totalContributionBeets.toNumber() < 2) {
        $("#total-usd-message").text("Enough to buy a beet.");
    } else {
        $("#total-usd-message").text("Enough to buy " + stats.totalContributionBeets.toFixed(0) + " beets!");
    }

    $("#total-tokens").text(stats.totalSupply.toFixed(3));
    if (stats.totalSupply <= 0) {
        $("#total-tokens-message").text("No Schrute Buck issued yet either.");
    } else {
        $("#total-tokens-message").text("Look at all those Schrute Buck!");
    }

    $("#stats").show();
}

function refresh() { getPrice().then(getStats).then(updatePage); }

$(function() {
    try {
        refresh();
        setInterval(refresh, 1000 * 60 * 5);
    } catch (err) { }
});
