// public/js/room-area-calculator.js — IIFE UI for the Square Footage Helper.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.roomArea) || null;

  var roomsList = document.getElementById('rooms-list');
  var addRoomBtn = document.getElementById('add-room-btn');
  var resultTotal = document.getElementById('result-total');
  var resultRooms = document.getElementById('result-rooms');
  var quoteLink = document.getElementById('quote-link');
  var footerYear = document.getElementById('footer-year');

  function escHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
  function num(n, dec) { return parseFloat(n.toFixed(typeof dec === 'number' ? dec : 0)).toLocaleString('en-US'); }

  // Build a single editable room row.
  function addRow(name, length, width) {
    var row = document.createElement('div');
    row.className = 'room-row';
    row.innerHTML =
      '<input class="form-input room-name" type="text" placeholder="Room name" aria-label="Room name" />' +
      '<input class="form-input room-len" type="number" inputmode="decimal" min="0" step="any" placeholder="Length" aria-label="Length (ft)" />' +
      '<span class="room-x">×</span>' +
      '<input class="form-input room-wid" type="number" inputmode="decimal" min="0" step="any" placeholder="Width" aria-label="Width (ft)" />' +
      '<span class="room-area-val">0 sq ft</span>' +
      '<button type="button" class="room-remove" title="Remove room" aria-label="Remove room">×</button>';
    if (name) row.querySelector('.room-name').value = name;
    if (length) row.querySelector('.room-len').value = length;
    if (width) row.querySelector('.room-wid').value = width;
    roomsList.appendChild(row);
    recalc();
  }

  function readRooms() {
    var rows = roomsList.querySelectorAll('.room-row');
    return Array.prototype.map.call(rows, function (row) {
      return {
        name: row.querySelector('.room-name').value,
        lengthFt: row.querySelector('.room-len').value,
        widthFt: row.querySelector('.room-wid').value,
        el: row
      };
    });
  }

  function recalc() {
    if (!math) return;
    var rooms = readRooms();
    rooms.forEach(function (r) {
      var a = math.rectangleArea(r.lengthFt, r.widthFt);
      r.el.querySelector('.room-area-val').textContent = num(a, 0) + ' sq ft';
    });
    var total = math.totalArea(rooms);
    resultTotal.textContent = num(total, 0);
    var counted = rooms.filter(function (r) { return math.rectangleArea(r.lengthFt, r.widthFt) > 0; }).length;
    resultRooms.textContent = counted + ' ' + (counted === 1 ? 'area' : 'areas');
    quoteLink.href = '/?prefill=' + encodeURIComponent('I have a project covering about ' + num(total, 0) + ' total square feet. ');
  }

  // Event delegation: live recompute on input, remove on button click.
  roomsList.addEventListener('input', recalc);
  roomsList.addEventListener('click', function (e) {
    var btn = e.target.closest('.room-remove');
    if (!btn) return;
    var rows = roomsList.querySelectorAll('.room-row');
    if (rows.length <= 1) { // keep at least one row; just clear it
      var row = btn.closest('.room-row');
      row.querySelector('.room-name').value = '';
      row.querySelector('.room-len').value = '';
      row.querySelector('.room-wid').value = '';
    } else {
      btn.closest('.room-row').remove();
    }
    recalc();
  });
  if (addRoomBtn) addRoomBtn.addEventListener('click', function () { addRow(); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  // Seed with two starter rows.
  addRow(); addRow();
})();
