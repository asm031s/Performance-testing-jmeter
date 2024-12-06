/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 87.5, "KoPercent": 12.5};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.75, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Partial Update Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Health Check"], "isController": false}, {"data": [0.0, 500, 1500, "auth"], "isController": false}, {"data": [1.0, 500, 1500, "Createbooking"], "isController": false}, {"data": [1.0, 500, 1500, "Update booking"], "isController": false}, {"data": [1.0, 500, 1500, "get_booking"], "isController": false}, {"data": [1.0, 500, 1500, "Delete booking"], "isController": false}, {"data": [0.0, 500, 1500, "Getbookig_ids"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 100, 12.5, 1116.796249999998, 293, 7250, 370.0, 3357.7, 3599.5999999999967, 5995.1500000000015, 62.686099357467484, 1389.0446858838739, 17.003298366243534], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Partial Update Booking", 100, 0, 0.0, 381.9100000000001, 306, 495, 370.0, 468.8, 479.0, 494.9, 18.294914013904133, 16.490435190267107, 5.659274377972923], "isController": false}, {"data": ["Health Check", 100, 0, 0.0, 311.2599999999999, 293, 359, 309.0, 321.9, 324.95, 358.96, 18.48428835489834, 13.652379852125692, 2.4729956099815156], "isController": false}, {"data": ["auth", 100, 100, 100.0, 3143.61, 2693, 3467, 3168.5, 3446.0, 3453.95, 3466.97, 28.81844380403458, 21.838976945244955, 7.120181916426513], "isController": false}, {"data": ["Createbooking", 100, 0, 0.0, 344.08, 294, 401, 341.0, 384.0, 392.84999999999997, 400.99, 18.16860465116279, 16.84925168059593, 8.303620094476745], "isController": false}, {"data": ["Update booking", 100, 0, 0.0, 381.78000000000003, 304, 483, 376.5, 462.9, 469.79999999999995, 482.99, 18.331805682859763, 16.457808203483044, 9.036291246562786], "isController": false}, {"data": ["get_booking", 100, 0, 0.0, 342.83, 302, 411, 334.0, 387.9, 403.5499999999999, 410.99, 18.331805682859763, 16.449215169569204, 3.0748739688359303], "isController": false}, {"data": ["Delete booking", 100, 0, 0.0, 376.49, 303, 488, 368.5, 466.5, 471.0, 487.87999999999994, 18.261504747991232, 13.455732971146823, 4.115258628560993], "isController": false}, {"data": ["Getbookig_ids", 100, 0, 0.0, 3652.4099999999994, 2068, 7250, 3327.0, 5567.800000000002, 6271.199999999999, 7244.4699999999975, 13.757050488375294, 2358.134715916907, 1.8808467464575596], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,983 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,051 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,200 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,812 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,282 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,174 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,882 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,441 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 2.0, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 3,342 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,032 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,386 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,894 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,903 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,066 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,301 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,446 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 4, 4.0, 0.5], "isController": false}, {"data": ["The operation lasted too long: It took 3,088 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,453 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,431 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,814 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,005 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,873 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,343 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,725 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,703 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,231 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,747 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,454 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,736 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,429 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 2.0, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 3,432 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,143 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,695 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,444 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,218 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,974 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,153 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,131 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,905 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,896 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,464 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 2.0, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 2,712 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,188 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,312 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,334 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,816 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,693 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,036 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,823 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,163 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,467 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,081 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,727 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,147 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,423 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,939 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,785 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,430 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,438 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,240 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,392 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,346 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,457 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,420 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 2.0, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 3,281 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,760 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,753 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,440 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,899 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,001 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,183 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,340 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,112 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,262 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,101 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,436 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 2.0, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 3,273 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,971 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,214 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,452 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,035 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,372 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,989 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 2.0, 0.25], "isController": false}, {"data": ["The operation lasted too long: It took 3,046 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,359 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,819 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,867 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,889 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,912 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 3,272 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}, {"data": ["The operation lasted too long: It took 2,755 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 1.0, 0.125], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 100, "The operation lasted too long: It took 3,446 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 4, "The operation lasted too long: It took 3,441 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 3,429 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 3,464 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 3,420 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["auth", 100, 100, "The operation lasted too long: It took 3,446 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 4, "The operation lasted too long: It took 3,441 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 3,429 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 3,464 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 3,420 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
