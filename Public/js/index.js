/**
* torn
*/
var favObj = {
	temp: {
		"mangerStatus": false,
		//"shakeAnima": "shake-little",
		"shakeAnima": "shake-rotate",
		"sortableClass": "sortable",
		"sortableInt": false,
		"sync_error_total": 0,
		"iconChange": false,
		"DATACache": {},
		"iconHtml": '',
		'nightMode': 'day',
	},
	DATA: {
		"version": '0.2',
		"oldDel": [], // 
		"oldSort": {}, // 旧图标 排序
		"addIcon": { // 自定义导航数据
			/*"http://i.keruyun.com": {
				"web_name": "keruyun",
				"web_name2": "导航",
				"web_url": "http://i.keruyun.com",
				"web_color": "#889456",
			},{...}*/
		}
	},



	
	/* 数据处理 */
	dataDeal: function () {
		var s = this;
		var version = s.DATA.version;
		var _data = s.dataMgr('DATA' + version);
		var data = _data || {};
		var _version = data.version || false;
		_version != false && _version != version && (data = s.oldDataDeal(_version, data)); // 转化旧数据
		s.DATA = $.extend(s.DATA, data);
	},
	/* 旧版本数据处理 */
	oldDataDeal: function(_version, data) {
		var version = _version || false;
		if (version == false) return false;
		var s = this;
		data = $.extend(s.DATA, data); // console.log(data);
		switch (version) {
			case "0.1.3":
				//data.oldSort = {};
				data = s.dealSortIcon(data, 1);
			default:
				break;
		}
		delete data.version;
		//console.log(data);
		return data;
	},
	/* 预处理操作 */
	preprocess: function() {
		var s = this;
		s.dataDeal();
		s.hideOld();
		s.showAddIcon();
		s.sortIcon();
		s.dayNight();
		//s.tool.tooltip();
		s.tool.mobileMode();
	},
	/* 事件绑定 */
	band: function() {
		var s = this;
		/* 展示颜色变化 */
		$(document).on('change', '#web_color', function() {
			var color = this.value;
			//$('span.show-color').css('background-color',color );
			s.tool.dealBackgroupSHadow('span.show-color', color);
		});
		/* id点击事件 - 管理/重置 */
		$(document).on('click', '#header-box, #nightMode, #add-btn, #reset-btn, #manger-btn, #login-btn, #info-btn, #update_user, #update_wallpaper, #do_reg, #do_login, #logout-btn, #cancel-btn', function() {
			var id = this.id;
			if (id == 'manger-btn' || id == 'cancel-btn') {
				s.mangerBtn(id);
			} else if (id == 'reset-btn') {
				s.resetDefaultIcon();
			} else if (id == 'add-btn') {
				//$('span.show-color').css('background-color','#2a78dc');
				//s.tool.dealBackgroupSHadow('span.show-color', '#2a78dc');
				s.tool.dealBackgroupSHadow('span.show-color', '42, 120, 220');
				$('#form-add')[0].reset();
			} else if ($.inArray(id, ['logout-btn', 'do_login', 'do_reg', 'update_user', 'info-btn', 'update_wallpaper']) != -1) {
				if (id == 'info-btn') id = 'user_info';
				if (id == 'user_info') s.showModal(id);
				return s.userManger(id);
			} else if (id == 'login-btn') {
				s.showModal('user');
			} else if (id == 'nightMode') {
				var className = $(this).hasClass('rijian') ? 'rijian' : 'yejian';
				s.nightModeSwitch(className);
			} else if (id == 'header-box') {
				var $header_wrap = $('.header_wrap');
				$header_wrap.hasClass('active') ? $header_wrap.removeClass('active') : $header_wrap.addClass('active');
				setTimeout(function() {
					$('#nightMode').click();
				}, 0);
			}
		});
		/* 添加导航 */
		$(document).on('submit', '#form-add', function(event) {
			event.preventDefault();
			s.addIcon();
			return false;
		});
		/* 删除/隐藏 图标 */
		$(document).on('click', '[add_del], [old_del]', function() {
			var old = $(this).attr('old_del') || false;
			var add = $(this).attr('add_del') || false;
			var type = old >= 1 ? 'old' : 'add';
			var id = type == 'old' ? old : add;
			s.delFavIcon(id, type);
			return false;
		});

		/* 搜索 */
		$('#b-btn, #q-btn').focus(function() {
			var id = this.id;
			var urlArr = {
				'b-btn': '//www.baidu.com/s?',
				'q-btn': '//g.kerushen.com/search?'
			}
			$('#search-form').attr('action', urlArr[id]);
		});
		$('#search-form').on('submit', function() {
			$('#q-word').val($('#b-word').val());
		});
		
	},
	/* 预先隐藏已删除默认图标 */
	hideOld: function() {
		var s = this;
		var delArr = s.DATA.oldDel;
		if (delArr.length < 1) {
			return false;
		}
		var del;
		for (var i in delArr) {
			del = delArr[i];
			$('[data_old="' + del + '"]').addClass('hide');
		}
	},
	/* 隐藏删除 */
	delFavIcon: function(id, _type) {
		/*if (!confirm('确定要删除该导航吗？')) {
			return false;
		}*/
		var s = this;
		var type = _type == 'old' ? 'old' : 'add';
		if (type == 'old') {
			s.DATA.oldDel.push(id);
			$('[data_old="' + id + '"]').addClass('hide');
		} else {
			delete s.DATA.addIcon[id];
			$('[data_add="' + id + '"]').remove();
		}
		//s.saveIconHtml();
		//s.dataMgr('DATA' + s.DATA.version, s.DATA, true);
		// 触发change状态
		s.temp.iconChange = true;
		$('#cancel-btn').addClass('act');
	},
	/* 保存当前的图标html字符串 */
	saveIconHtml: function() {
		var s = this;
		var iconHtml = s.tool.getIconHtml();
	},
	/* 预先展示自定义添加导航 */
	showAddIcon: function() {
		var s = this;
		var obj = s.DATA.addIcon;
		for (var i in obj) {
			s.tool.dealNewIcon(obj[i]);
		}
	},
	/* 执行图标排序 */
	sortIcon: function() {
		var s = this;
		var icon_arr = [], obj = {}, sort = 0;
		for (var io in s.DATA.oldSort) {
			sort = s.DATA.oldSort[io];
			obj = {"sort": sort, "dom": $('[data_old="' + io + '"]:eq(0)')};
			icon_arr.push(obj);
		}
		if (icon_arr.length == 0) return false; // 无排序信息
		for (var ia in s.DATA.addIcon) {
			sort = s.DATA.addIcon[ia].sort;
			obj = {"sort": sort, "dom": $('[data_add="' + ia + '"]:eq(0)')};
			icon_arr.push(obj);
		}
		// 排序处理
		icon_arr = s.tool.arraySort(icon_arr, 'sort', 0);
		var icon_dom_arr = [], $dom;
		for (var id in icon_arr) {
			$dom = icon_arr[id].dom;
			icon_dom_arr.push($dom);
		}
		$('ul.recommonds>li').remove();
		$('ul.recommonds').append(icon_dom_arr);
	},
	// 拖拽事件处理
	dealBandSortable: function(className, _flag) {
		var s = this;
		var flag = _flag || false;
		if (!flag && s.temp.sortableInt == true) {
			sortable('.' + className, 'enable'); // 激活
			return;
		}
		if (flag) sortable('.' + className, 'destroy'); // 销毁绑定 
		sortable('.' + className, {placeholderClass: 'st-move'})[0].addEventListener('sortupdate', function(e) {
			//console.log(e.detail);// test
			//s.dealSortIcon(true); // 排序处理
			// 触发cchange状态
			s.temp.iconChange = true;
			$('#cancel-btn').addClass('act');
		});
		s.temp.sortableInt = true;
	},

		// 阴影背景色 处理
		dealBackgroupSHadow: function(selector, color, _dom) {
			var dom = _dom || document;
			$(selector, dom).css('background-color', 'rgb(' + color + ')').css('box-shadow', '0 10px 10px -6px rgba(' + color + ', 0.75');
		},
		// 数组排序
		arraySort: function(arr, sort_field, _type) { // type [0]顺序 [1]倒序
			var sort_field = sort_field || false;
			if (!sort_field || !$.isArray(arr)) return false;
			var type = _type || 0;
			if ($.inArray(type, [0, 1]) == -1) type = 0;
			
			arr.sort(function(a, b) {
				if (typeof a[sort_field] == 'undefined' || a[sort_field] < b[sort_field]) {
					return 1;
				} else if (typeof b[sort_field] == 'undefined' || a[sort_field] > b[sort_field]) {
					return -1;
				}
				return 0;
			});
			type == 0 && arr.reverse();
			return arr;
		},
		// 获取
		getIconHtml: function() {
			return $('ul.recommonds')[0].outerHTML;
		},
		// 展示tips
		tooltip: function() {
			$('[data-toggle="tooltip"]').tooltip();
		},
		// 移动端 自适应
		mobileMode: function() {
			var bodyWidth = document.documentElement.clientWidth;
			if (bodyWidth < 900) {
				var initSize = bodyWidth / 320 * 625;
				document.documentElement.setAttribute('style', 'font-size: ' + initSize + '% !important');
			}
			window.onresize = function () {
				if ($("input:focus").length > 0) return false;
				var bodyWidth = document.documentElement.clientWidth;
				if (bodyWidth < 900) {
					var initSize = bodyWidth / 320 * 625;//17px//625
					document.documentElement.setAttribute('style', 'font-size: ' + initSize + '% !important');
				}
				favObj.tool.changeWallpaperLogo(favObj.temp.nightMode, 'wallpaper'); // 壁纸动态切换
			}
		},
	},
	/* 数据存储管理 */
	dataMgr: function(_name, data, _sync_flag) { // _data = null
		var s = this;
		//var data = _data || null;
		var name = _name || null;
		var sync_flag = _sync_flag || false;
		if (_name == null) {
			return false;
		}
		if (typeof data == 'undefined') {
			var item = localStorage.getItem(name);
			return JSON.parse(item) || {};
		} else {
			var itemStr = JSON.stringify(data);
			localStorage.setItem(name, itemStr);
			if (sync_flag && user_data != null) {
				$.post('index.php?m=Damalu&c=Index&a=doSync', {"data": encodeURIComponent(itemStr), "token": user_data.user_info.token}, function(data) {
					if (typeof data.error != 'undefined') {
						//s.showModal('tips', data.error);
						if (typeof data.code != 'undefined') {
							s.showModal('tips', data.error);
							setTimeout(function() {location.reload();}, 3000);
						}
						++s.temp.sync_error_total;
						s.showModal('tips', data.error + " [次数：" + s.temp.sync_error_total + "]");
						return false;
					} else {
						s.showModal('tips', data.msg);
						setTimeout(function() {
							s.showModal('hide');
						}, 500);
						s.temp.sync_error_total = 0;
						user_data.user_info.token = data.token;
					}
				}, 'json');
			}
			//console.log(name + ' save !');
		}
	},
	/* 提示框 */
	showModal: function(_title, _content) {
		var s = this;
		var title = _title || '^_^';
		if (title == null) {
			return false;
		} else if (title == 'hide') {
			$('#myModal').modal('hide');
			return;
		}
		$('[modal-title], [modal-body]').addClass('hide');
		if (title == 'tips') {
			$('[modal-body="' + title + '"]').html(_content);
		} else if (title == 'setting') {
			$('#fenyeTwo').val(s.DATA.fenyeTwo);
			$('#searchFenye').text(s.DATA.fenye);
			$('#searchType').val(s.DATA.searchType);
		}
		$('[modal-title="' + title + '"], [modal-body="' + title + '"]').removeClass('hide');
		$('#myModal').modal('show');
	},
	/* 白黑切换 */
	dayNight: function() {
		var s = this, type = 'day';
		var nightMode = s.dataMgr('nightMode') || null;
		if (nightMode == null) {
			nightMode = {"status": "day"};
			s.dataMgr('nightMode', nightMode);
		} else {
			type = nightMode.status;
		}
		s.temp.nightMode = type;
		if (type == 'night') $('#nightMode').click();
	},
	/* 白/黑间模式切换 */
	nightModeSwitch: function(className) {
		var s = this;
		var $bs = $('#bs-css');
		var $ng = $('#ng-css');
		var type = "day";
		if (className == 'rijian') {
			$('#nightMode').attr('class', 'yejian');
			$('#nightMode').text("黑间模式");
			$('body').removeClass('night-mode');
			$bs[0].href = $bs.data('href');
			setTimeout(function() {
				if (s.temp.nightMode == 'night') return false;
				$ng[0].href = '';
			}, 500);
		} else {
			var type = "night";
			$('#nightMode').attr('class','rijian');
			$('#nightMode').text("白天模式");
			$('body').addClass('night-mode');
			$ng[0].href = $ng.data('href');
			setTimeout(function() {
				if (s.temp.nightMode == 'day') return false;
				$bs[0].href = '';
			}, 1500);
		}
		s.temp.nightMode = type;
		s.tool.changeWallpaperLogo(type); //, 'wallpaper'
		s.dataMgr('nightMode', {"status": type});
	}
};

favObj.init();//
