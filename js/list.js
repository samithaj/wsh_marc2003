_.mixin({
	list : function (mode, x, y, w, h) {
		this.size = function () {
			this.rows = _.floor((this.h - 30) / (this.mode == "echonest" ? 90 : panel.row_height));
			this.index = 0;
			this.offset = 0;
			this.up_btn.x = this.x + _.round((this.w - 15) / 2);
			this.down_btn.x = this.up_btn.x;
			this.up_btn.y = this.y;
			this.down_btn.y = this.y + this.h - 15;
		}
		
		this.paint = function (gr) {
			if (this.items == 0)
				return;
			switch (this.mode) {
			case "autoplaylists":
				gr.SetTextRenderingHint(4);
				this.text_width = this.w - 30;
				for (var i = 0; i < Math.min(this.items, this.rows); i++) {
					gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, panel.colours.text, this.x, this.y + 15 + (i * panel.row_height), this.text_width, panel.row_height, LEFT);
					if (!this.editing && this.hover && this.index == i + this.offset)
						gr.DrawString(guifx.drop, this.guifx_font, panel.colours.highlight, this.x + this.w - 20, this.y + 17 + (i * panel.row_height), panel.row_height, panel.row_height, SF_CENTRE);
				}
				break;
			case "echonest":
				for (var i = 0; i < Math.min(this.items, this.rows); i++) {
					gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.title, panel.colours.highlight, this.x, this.y + 15 + (i * 90), this.w - 110, 24, LEFT);
					gr.GdiDrawText(this.data[i + this.offset].date, panel.fonts.title, panel.colours.highlight, this.x, this.y + 15 + (i * 90), this.w, 24, RIGHT);
					gr.GdiDrawText(this.data[i + this.offset].summary, this.font, panel.colours.text, this.x, this.y + 37 + (i * 90), this.w, (this.font.Height * _.floor(64 / this.font.Height)) + 3, DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX);
				}
				break;
			case "lastfm_info":
				switch (this.lastfm_mode) {
				case 0:
					this.text_x = 0;
					this.text_width = this.w;
					for (var i = 0; i < Math.min(this.items, this.rows); i++) {
						gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, panel.colours.text, this.x, this.y + 15 + (i * panel.row_height), this.w, panel.row_height, LEFT);
					}
					break;
				case 1:
					this.text_x = gr.CalcTextWidth("000.", panel.fonts.normal) + 5;
					this.text_width = _.round(this.w / 2.75);
					var lastfm_charts_bar_x = this.x + this.text_x + this.text_width + 10;
					var unit_width = (this.w - lastfm_charts_bar_x - 50) / this.data[0].playcount;
					var bar_width;
					var bar_colour = _.splitRGB(this.lastfm_charts_colour);
					for (var i = 0; i < Math.min(this.items, this.rows); i++) {
						bar_width = _.ceil(unit_width * this.data[i + this.offset].playcount);
						gr.GdiDrawText(this.data[i + this.offset].rank + ".", panel.fonts.normal, panel.colours.highlight, this.x, this.y + 15 + (i * panel.row_height), this.text_x - 5, panel.row_height, RIGHT);
						gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, panel.colours.text, this.x + this.text_x, this.y + 15 + (i * panel.row_height), this.text_width, panel.row_height, LEFT);
						gr.FillSolidRect(lastfm_charts_bar_x, this.y + 17 + (i * panel.row_height), bar_width, panel.row_height - 3, bar_colour);
						gr.GdiDrawText(_.formatNumber(this.data[i + this.offset].playcount, ","), panel.fonts.normal, panel.colours.text, lastfm_charts_bar_x + bar_width + 5, this.y + 15 + (i * panel.row_height), 50, panel.row_height, LEFT);
					}
					break;
				case 2:
					this.text_x = 0;
					this.text_width = this.w;
					for (var i = 0; i < Math.min(this.items, this.rows); i++) {
						gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, panel.colours.text, this.x + this.text_x, this.y + 15 + (i * panel.row_height), this.text_width, panel.row_height, LEFT);
						gr.GdiDrawText(this.data[i + this.offset].similar, panel.fonts.normal, panel.colours.highlight, this.x, this.y + 15 + (i * panel.row_height), this.w, panel.row_height, RIGHT);
					}
					break;
				}
				break;
			case "musicbrainz":
				if (this.mb_mode == 0) {
					this.text_x = 0;
					this.text_width = this.w - gr.CalcTextWidth("0000", panel.fonts.normal) - 10;
					for (var i = 0; i < Math.min(this.items, this.rows); i++) {
						gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, this.data[i + this.offset].width == 0 ? panel.colours.highlight : panel.colours.text, this.x + this.text_x, this.y + 15 + (i * panel.row_height), this.text_width, panel.row_height, LEFT);
						gr.GdiDrawText(this.data[i + this.offset].date, panel.fonts.normal, panel.colours.highlight, this.x, this.y + 15 + (i * panel.row_height), this.w, panel.row_height, RIGHT);
					}
				} else {
					this.text_x = this.mb_icons ? 20 : 0;
					this.text_width = this.w - this.text_x;
					for (var i = 0; i < Math.min(this.items, this.rows); i++) {
						var y = this.y + 15 + (i * panel.row_height);
						if (this.mb_icons)
							_.drawImage(gr, this.mb_images[this.data[i + this.offset].image], this.x, y + _.round((panel.row_height - 16) / 2), 16, 16, image.centre);
						gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, panel.colours.text, this.x + this.text_x, y, this.text_width, panel.row_height, LEFT);
					}
				}
				break;
			case "properties":
				this.text_x = _.round(this.w * 0.3);
				this.text_width = this.w - this.text_x;
				for (var i = 0; i < Math.min(this.items, this.rows); i++) {
					gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, panel.colours.highlight, this.x, this.y + 15 + (i * panel.row_height), this.text_x - 10, panel.row_height, LEFT);
					gr.GdiDrawText(this.data[i + this.offset].value, panel.fonts.normal, panel.colours.text, this.x + this.text_x, this.y + 15 + (i * panel.row_height), this.text_width, panel.row_height, LEFT);
				}
				break;
			}
			this.up_btn.paint(gr, panel.colours.text);
			this.down_btn.paint(gr, panel.colours.text);
		}
		
		this.metadb_changed = function () {
			switch (true) {
			case !panel.metadb:
			case this.mode == "autoplaylists":
			case this.mode == "lastfm_info" && this.lastfm_mode > 0:
				break;
			case this.mode == "properties":
				this.update();
				break;
			case this.mode == "musicbrainz":
				var temp_artist = panel.tf(panel.artist_tf);
				var temp_id = panel.tf("$if3($meta(musicbrainz_artistid,0),$meta(musicbrainz artist id,0),)");
				if (this.artist == temp_artist && this.mb_id == temp_id)
					return;
				this.artist = temp_artist;
				this.mb_id = temp_id;
				this.update();
				break;
			default:
				var temp_artist = panel.tf(panel.artist_tf);
				if (this.artist == temp_artist)
					return;
				this.artist = temp_artist;
				this.update();
				break;
			}
		}
		
		this.trace = function (x, y) {
			return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		}
		
		this.wheel = function (s) {
			if (this.trace(this.mx, this.my)) {
				if (this.items > this.rows) {
					var offset = this.offset - (s * (this.mode == "echonest" ? 1 : 5));
					if (offset < 0)
						offset = 0;
					if (offset + this.rows > this.items)
						offset = this.items - this.rows;
					if (this.offset != offset) {
						this.offset = offset;
						window.RepaintRect(this.x, this.y, this.w, this.h);
					}
				}
				return true;
			} else {
				return false;
			}
		}
		
		this.move = function (x, y) {
			this.mx = x;
			this.my = y;
			this.index = _.floor((y - this.y - 15) / (this.mode == "echonest" ? 90 : panel.row_height)) + this.offset;
			this.in_range = this.index >= this.offset && this.index < this.offset + Math.min(this.rows, this.items);
			switch (true) {
			case !this.trace(x, y):
			case this.mode == "autoplaylists" && this.editing:
				window.SetCursor(IDC_ARROW);
				this.leave();
				return false;
			case this.up_btn.move(x, y):
			case this.down_btn.move(x, y):
				break;
			case !this.in_range:
				window.SetCursor(IDC_ARROW);
				this.leave();
				break;
			case this.mode == "autoplaylists":
				switch (true) {
				case x > this.x && x < this.x + Math.min(this.data[this.index].width, this.text_width):
					window.SetCursor(IDC_HAND);
					_.tt("Run query \"" + this.data[this.index].name + "\"");
					break;
				case x > this.x + this.w - 20 && x < this.x + this.w:
					window.SetCursor(IDC_HAND);
					_.tt("Edit \"" + this.data[this.index].name + "\"");
					break;
				default:
					window.SetCursor(IDC_ARROW);
					_.tt("");
					this.leave();
					break;
				}
				this.hover = true;
				window.RepaintRect(this.x + this.w - 20, this.y, 20, this.h);
				break;
			case this.mode == "echonest":
			case x > this.x + this.text_x && x < this.x + this.text_x + Math.min(this.data[this.index].width, this.text_width):
				window.SetCursor(IDC_HAND);
				_.tt(this.mode == "properties" ? "Autoplaylist: " + this.data[this.index].query : this.data[this.index].url);
				break;
			default:
				window.SetCursor(IDC_ARROW);
				_.tt("");
				break;
			}
			return true;
		}
		
		this.leave = function () {
			if (this.mode == "autoplaylists" && this.hover) {
				this.hover = false;
				window.RepaintRect(this.x + this.w - 20, this.y, 20, this.h);
			}
		}
		
		this.lbtn_up = function (x, y) {
			switch (true) {
			case !this.trace(x, y):
				return false;
			case this.mode == "autoplaylists" && this.editing:
			case this.up_btn.lbtn_up(x, y):
			case this.down_btn.lbtn_up(x, y):
			case !this.in_range:
				break;
			case this.mode == "autoplaylists":
				switch (true) {
				case x > this.x && x < this.x + Math.min(this.data[this.index].width, this.text_width):
					this.run_query(this.data[this.index].name, this.data[this.index].query, this.data[this.index].sort, this.data[this.index].forced);
					break;
				case x > this.x + this.w - 20 && x < this.x + this.w:
					this.edit(x, y);
					break;
				}
				break;
			case this.mode == "echonest":
			case x > this.x + this.text_x && x < this.x + this.text_x + Math.min(this.data[this.index].width, this.text_width):
				if (this.mode == "properties") {
					fb.CreateAutoPlaylist(fb.PlaylistCount, this.data[this.index].name, this.data[this.index].query);
					fb.ActivePlaylist = fb.PlaylistCount - 1;
				} else {
					_.browser(this.data[this.index].url);
				}
				break;
			}
			return true;
		}
		
		this.rbtn_up = function (x, y) {
			switch (this.mode) {
			case "autoplaylists":
				panel.m.AppendMenuItem(this.editing ? MF_GRAYED: MF_STRING, 3000, "Add new autoplaylist...");
				panel.m.AppendMenuSeparator();
				if (this.deleted_items.length > 0) {
					_(this.deleted_items)
						.take(8)
						.forEach(function (item, i) {
							panel.s10.AppendMenuItem(MF_STRING, i + 3010, item.name);
						})
						.value();
					panel.s10.AppendTo(panel.m, MF_STRING, "Restore");
					panel.m.AppendMenuSeparator();
				}
				break;
			case "echonest":
				_.forEach(this.echonest_modes, function (item, i) {
					panel.m.AppendMenuItem(MF_STRING, i + 3050, _.capitalize(item));
				});
				panel.m.CheckMenuRadioItem(3050, 3052, this.echonest_mode + 3050);
				panel.m.AppendMenuSeparator();
				break;
			case "lastfm_info":
				panel.m.AppendMenuItem(MF_STRING, 3100, "Artist Info");
				panel.m.AppendMenuItem(MF_STRING, 3101, "User Charts");
				panel.m.AppendMenuItem(MF_STRING, 3102, "User Recommendations");
				panel.m.CheckMenuRadioItem(3100, 3102, this.lastfm_mode + 3100);
				panel.m.AppendMenuSeparator();
				switch (this.lastfm_mode) {
				case 0:
					_.forEach(this.lastfm_artist_methods, function (item, i) {
						panel.m.AppendMenuItem(MF_STRING, i + 3110, _.capitalize(item.display));
					});
					panel.m.CheckMenuRadioItem(3110, 3114, this.lastfm_artist_method + 3110);
					panel.m.AppendMenuSeparator();
					break;
				case 1:
					_.forEach(this.lastfm_charts_methods, function (item, i) {
						panel.m.AppendMenuItem(MF_STRING, i + 3120, _.capitalize(item.display));
					});
					panel.m.CheckMenuRadioItem(3120, 3122, this.lastfm_charts_method + 3120);
					panel.m.AppendMenuSeparator();
					_.forEach(this.lastfm_charts_periods, function (item, i) {
						panel.m.AppendMenuItem(MF_STRING, i + 3130, _.capitalize(item.display));
					});
					panel.m.CheckMenuRadioItem(3130, 3135, this.lastfm_charts_period + 3130);
					panel.m.AppendMenuSeparator();
					panel.m.AppendMenuItem(MF_STRING, 3140, "Bar colour...");
					panel.m.AppendMenuSeparator();
					break;
				}
				panel.m.AppendMenuItem(MF_STRING, 3150, "Last.fm username...");
				panel.m.AppendMenuItem(lastfm.username.length > 0 ? MF_STRING : MF_GRAYED, 3151, "Last.fm password...");
				panel.m.AppendMenuSeparator();
				break;
			case "musicbrainz":
				panel.m.AppendMenuItem(MF_STRING, 3200, "Releases");
				panel.m.AppendMenuItem(MF_STRING, 3201, "Links");
				panel.m.CheckMenuRadioItem(3200, 3201, this.mb_mode + 3200);
				panel.m.AppendMenuSeparator();
				if (this.mb_id.length != 36) {
					panel.m.AppendMenuItem(MF_STRING, 3203, "MBID Missing: Search Musicbrainz website for this artist");
					panel.m.AppendMenuSeparator();
				}
				if (this.mb_mode == 1) {
					panel.m.AppendMenuItem(MF_STRING, 3210, "Show icons");
					panel.m.CheckMenuItem(3210, this.mb_icons);
					panel.m.AppendMenuSeparator();
				}
				break;
			}
			panel.m.AppendMenuItem(_.isFile(this.filename) ? MF_STRING : MF_GRAYED, 3999, "Open containing folder");
			panel.m.AppendMenuSeparator();
		}
		
		this.rbtn_up_done = function (idx) {
			switch (idx) {
			case 3000:
				this.add();
				break;
			case 3010:
			case 3011:
			case 3012:
			case 3013:
			case 3014:
			case 3015:
			case 3016:
			case 3017:
				this.data.push(this.deleted_items[idx - 3010]);
				this.deleted_items.splice(idx - 3010, 1);
				this.save();
				this.update();
				break;
			case 3050:
			case 3051:
			case 3052:
				this.echonest_mode = idx - 3050;
				window.SetProperty("2K3.LIST.ECHONEST.MODE", this.echonest_mode);
				this.artist = "";
				panel.item_focus_change();
				break;
			case 3100:
			case 3101:
			case 3102:
				this.lastfm_mode = idx - 3100;
				window.SetProperty("2K3.LIST.LASTFM.MODE", this.lastfm_mode);
				if (this.lastfm_mode == 0) {
					this.artist = "";
					panel.item_focus_change();
				} else {
					this.update();
				}
				break;
			case 3110:
			case 3111:
			case 3112:
			case 3113:
			case 3114:
				this.lastfm_artist_method = idx - 3110;
				window.SetProperty("2K3.LIST.LASTFM.ARTIST.METHOD", this.lastfm_artist_method);
				this.artist = "";
				panel.item_focus_change();
				break;
			case 3120:
			case 3121:
			case 3122:
				this.lastfm_charts_method = idx - 3120;
				window.SetProperty("2K3.LIST.LASTFM.CHARTS.METHOD", this.lastfm_charts_method);
				this.update();
				break;
			case 3130:
			case 3131:
			case 3132:
			case 3133:
			case 3134:
			case 3135:
				this.lastfm_charts_period = idx - 3130;
				window.SetProperty("2K3.LIST.LASTFM.CHARTS.PERIOD", this.lastfm_charts_period);
				this.update();
				break;
			case 3140:
				this.lastfm_charts_colour = _.input("Enter a custom colour for the bars. Uses RGB. Example usage:\n\n72-127-221", panel.name, this.lastfm_charts_colour);
				window.SetProperty("2K3.LIST.LASTFM.CHARTS.COLOUR", this.lastfm_charts_colour);
				window.Repaint();
				break;
			case 3150:
				lastfm.update_username();
				break;
			case 3151:
				lastfm.update_password();
				break;
			case 3200:
			case 3201:
				this.mb_mode = idx - 3200;
				window.SetProperty("2K3.LIST.MUSICBRAINZ.MODE", this.mb_mode);
				this.artist = "";
				panel.item_focus_change();
				break;
			case 3203:
				_.browser("https://musicbrainz.org/search?type=artist&method=indexed&query=" + encodeURIComponent(_.mbEscape(this.artist)));
				break;
			case 3210:
				this.mb_icons = !this.mb_icons;
				window.SetProperty("2K3.LIST.MUSICBRAINZ.SHOW.ICONS", this.mb_icons);
				window.Repaint();
				break;
			case 3999:
				_.explorer(this.filename);
				break;
			}
		}
		
		this.key_down = function (k) {
			switch (k) {
			case VK_UP:
				this.wheel(1);
				return true;
			case VK_DOWN:
				this.wheel(-1);
				return true;
			default:
				return false;
			}
		}
		
		this.update = function () {
			this.items = 0;
			this.offset = 0;
			this.index = 0;
			this.data = [];
			switch (this.mode) {
			case "autoplaylists":
				this.data = _.jsonParse(_.open(this.filename));
				_.forEach(this.data, function (item) {
					item.width = _.textWidth(item.name, panel.fonts.normal);
				});
				this.items = this.data.length;
				break;
			case "echonest":
				this.filename = panel.new_artist_folder(this.artist) + "echonest.json";
				if (_.isFile(this.filename)) {
					var data = _.jsonParse(_.open(this.filename), "response.artist." + this.echonest_modes[this.echonest_mode]);
					this.data = _.map(data, function (item, i) {
						var temp_date = (item.date_posted || item.date_reviewed || item.date_found || "").substring(0, 10);
						var temp_summary = _.stripTags(item.summary);
						return {
							name : _.stripTags(item.name).replace(/\s{2,}/g, " "),
							date : temp_date,
							url : (item.url || "").replace(/\\/g, ""),
							summary : temp_summary.length > 0 ? temp_summary : "<no summary>"
						};
					});
					this.items = this.data.length;
					if (_.fileExpired(this.filename, ONE_DAY))
						this.get();
				} else {
					this.get();
				}
				break;
			case "lastfm_info":
				if (lastfm.api_key.length != 32) {
					panel.console("Last.fm API KEY not set.");
					break;
				}
				switch (this.lastfm_mode) {
				case 0:
					this.filename = panel.new_artist_folder(this.artist) + "lastfm." + this.lastfm_artist_methods[this.lastfm_artist_method].method + ".json";
					if (_.isFile(this.filename)) {
						var data = _.jsonParse(_.open(this.filename), this.lastfm_artist_methods[this.lastfm_artist_method].json);
						if (_.isUndefined(data.length))
							data = [data];
						this.data = _.map(data, function (item) {
							return {
								name : item.name,
								width : _.textWidth(item.name, panel.fonts.normal),
								url : item.url
							};
						});
						this.items = this.data.length;
						if (_.fileExpired(this.filename, ONE_DAY))
							this.get();
					} else {
						this.get();
					}
					break;
				case 1:
					this.filename = folders.data + "lastfm\\" + lastfm.username + "." + this.lastfm_charts_methods[this.lastfm_charts_method].method + "." + this.lastfm_charts_periods[this.lastfm_charts_period].period + ".json";
					if (_.isFile(this.filename)) {
						var data = _.jsonParse(_.open(this.filename), this.lastfm_charts_methods[this.lastfm_charts_method].json);
						if (_.isUndefined(data.length))
							data = [data];
						for (var i = 0; i < data.length; i++) {
							var name = this.lastfm_charts_method == 0 ? data[i].name : data[i].artist.name + " - " + data[i].name;
							this.data[i] = {
								name : name,
								width : _.textWidth(name, panel.fonts.normal),
								url : data[i].url,
								playcount : data[i].playcount,
								rank : i > 0 && data[i].playcount == data[i - 1].playcount ? this.data[i - 1].rank : data[i]["@attr"].rank
							};
						}
						this.items = this.data.length;
						if (_.fileExpired(this.filename, ONE_DAY))
							this.get();
					} else {
						this.get();
					}
					break;
				case 2:
					if (lastfm.sk.length != 32) {
						panel.console("Password not set.");
						break;
					}
					this.filename = folders.data + "lastfm\\" + lastfm.username + ".user.getRecommendedArtists.json";
					if (_.isFile(this.filename)) {
						var data = _.jsonParse(_.open(this.filename), "recommendations.artist");
						if (_.isUndefined(data.length))
							data = [data];
						this.data = _.map(data, function (item) {
							if (_.isUndefined(item.context.artist.length))
								item.context.artist = [item.context.artist];
							var similar = _.map(item.context.artist, "name").join(", ");
							return {
								name : item.name,
								width : _.textWidth(item.name, panel.fonts.normal),
								url : item.url,
								similar : similar
							};
						});
						this.items = this.data.length;
						if (_.fileExpired(this.filename, ONE_DAY))
							lastfm.post("user.getRecommendedArtists");
					} else {
						lastfm.post("user.getRecommendedArtists");
					}
					break;
				}
				break;
			case "musicbrainz":
				if (this.mb_mode == 0) {
					this.mb_data = [];
					this.mb_offset = 0;
					this.filename = panel.new_artist_folder(this.artist) + "musicbrainz.releases." + this.mb_id + ".json";
					if (_.isFile(this.filename)) {
						var data = _(_.jsonParse(_.open(this.filename)))
							.sortByOrder(["first-release-date", "title"], ["desc", "asc"])
							.map(function (item) {
								return {
									name : item.title,
									width : _.textWidth(item.title, panel.fonts.normal),
									url : "http://musicbrainz.org/release-group/" + item.id,
									date : item["first-release-date"].substring(0, 4),
									primary : item["primary-type"],
									secondary : item["secondary-types"].sort()[0] || null
								};
							})
							.nest(["primary", "secondary"])
							.value();
						_.forEach(["Album", "Single", "EP", "Other", "Broadcast", "null"], function (primary) {
							_.forEach(["null", "Audiobook", "Compilation", "Demo", "DJ-mix", "Interview", "Live", "Mixtape/Street", "Remix", "Spokenword", "Soundtrack"], function (secondary) {
								var group = _.get(data, primary + "." + secondary);
								if (group) {
									var name = (primary + " + " + secondary).replace("null + null", "Unspecified type").replace("null + ", "").replace(" + null", "");
									this.data.push({"name" : name, "width" : 0, "url" : "", "date" : ""});
									this.data.push.apply(this.data, group);
									this.data.push({"name" : "", "width" : 0, "url" : "", "date" : ""});
								}
							}, this);
						}, this);
						this.data.pop();
						this.items = this.data.length;
						if (_.fileExpired(this.filename, ONE_DAY))
							this.get();
					} else {
						this.get();
					}
				} else {
					this.filename = panel.new_artist_folder(this.artist) + "musicbrainz.links." + this.mb_id + ".json";
					if (_.isFile(this.filename)) {
						var url = "https://musicbrainz.org/artist/" + this.mb_id;
						var image = "musicbrainz";
						this.data.push({
							name : url,
							url : url,
							width : _.textWidth(url, panel.fonts.normal),
							image : image
						});
						this.data.push.apply(this.data, _.map(_.jsonParse(_.open(this.filename), "relations"), this.mb_parse_urls));
						this.items = this.data.length;
						if (_.fileExpired(this.filename, ONE_DAY))
							this.get();
					} else {
						this.get();
					}
				}
				break;
			case "properties":
				this.filename = panel.metadb.Path;
				var fileinfo = panel.metadb.GetFileInfo();
				this.add_meta(fileinfo);
				this.add_location();
				this.add_properties(fileinfo);
				this.add_customdb();
				this.add_stats();
				_.forEach(this.data, function (item) {
					item.width = _.textWidth(item.value, panel.fonts.normal);
				});
				fileinfo.Dispose();
				this.items = this.data.length;
				break;
			}
			window.Repaint();
		}
		
		this.get = function () {
			var url, f = this.filename;
			switch (this.mode) {
			case "echonest":
				if (!_.tagged(this.artist))
					return;
				url = "http://developer.echonest.com/api/v4/artist/profile/?api_key=EKWS4ESQLKN3G2ZWV&bucket=blogs&bucket=news&bucket=reviews&name=" + encodeURIComponent(this.artist);
				break;
			case "lastfm_info":
				if (this.lastfm_mode == 0) {
					if (!_.tagged(this.artist))
						return;
					url = lastfm.get_base_url() + "&limit=100&method=" + this.lastfm_artist_methods[this.lastfm_artist_method].method + "&artist=" + encodeURIComponent(this.artist);
				} else {
					if (lastfm.username.length == 0)
						return panel.console("Username not set.");
					url = lastfm.get_base_url() + "&limit=100&method=" + this.lastfm_charts_methods[this.lastfm_charts_method].method + "&period=" + this.lastfm_charts_periods[this.lastfm_charts_period].period + "&user=" + lastfm.username;
				}
				break;
			case "musicbrainz":
				if (this.mb_id.length != 36)
					return panel.console("Invalid/missing MBID");
				if (this.mb_mode == 0)
					url = "https://musicbrainz.org/ws/2/release-group?fmt=json&limit=100&offset=" + this.mb_offset + "&artist=" + this.mb_id;
				else
					url = "https://musicbrainz.org/ws/2/artist/" + this.mb_id + "?fmt=json&inc=url-rels";
				break;
			default:
				return;
			}
			this.xmlhttp.open("GET", url, true);
			this.xmlhttp.setRequestHeader("User-Agent", this.ua);
			this.xmlhttp.setRequestHeader("If-Modified-Since", "Thu, 01 Jan 1970 00:00:00 GMT");
			this.xmlhttp.send();
			this.xmlhttp.onreadystatechange = _.bind(function () {
				if (this.xmlhttp.readyState == 4) {
					if (this.xmlhttp.status == 200)
						this.success(f);
					else
						panel.console(this.xmlhttp.responsetext || "HTTP error: " + this.xmlhttp.status);
				}
			}, this);
		}
		
		this.success = function (f) {
			var data = _.jsonParse(this.xmlhttp.responsetext);
			switch (true) {
			case this.mode == "musicbrainz" && this.mb_mode == 0:
				var max_offset = Math.min(500, data["release-group-count"]) - 100;
				if (data["release-groups"].length > 0)
					this.mb_data.push.apply(this.mb_data, data["release-groups"]);
				if (this.mb_offset < max_offset) {
					this.mb_offset += 100;
					this.get();
				} else {
					_.save(JSON.stringify(this.mb_data), f);
					this.artist = "";
					panel.item_focus_change();
				}
				break;
			case this.mode == "musicbrainz": //links
			case this.mode == "echonest":
				_.save(JSON.stringify(data), f);
				this.artist = "";
				panel.item_focus_change();
				break;
			case this.mode == "lastfm_info" && this.lastfm_mode == 0: //artist stuff (especially similar) needs checking
				if (data.error)
					return panel.console(data.message);
				var temp = _.jsonParse(this.xmlhttp.responsetext, this.lastfm_artist_methods[this.lastfm_artist_method].json);
				if (_.isUndefined(temp.length))
					temp = [temp];
				if (temp.length == 0)
					return;
				_.save(JSON.stringify(data), f);
				this.artist = "";
				panel.item_focus_change();
				break;
			case this.mode == "lastfm_info":
				if (data.error)
					return panel.console(data.message);
				_.save(JSON.stringify(data), f);
				this.update();
				break;
			}
		}
		
		this.header_text = function () {
			switch (this.mode) {
			case "autoplaylists":
				return "Autoplaylists";
			case "echonest":
				return this.artist + ": " + this.echonest_modes[this.echonest_mode];
			case "lastfm_info":
				switch (this.lastfm_mode) {
				case 0:
					return this.artist + ": " + this.lastfm_artist_methods[this.lastfm_artist_method].display;
				case 1:
					return lastfm.username + ": " + this.lastfm_charts_periods[this.lastfm_charts_period].display + " " + this.lastfm_charts_methods[this.lastfm_charts_method].display + " charts";
				case 2:
					return lastfm.username + ": recommended artists";
				}
			case "musicbrainz":
				return this.artist + ": " + (this.mb_mode == 0 ? "releases" : "links");
			case "properties":
				return panel.tf("%artist% - %title%");
			}
		}
		
		this.init = function () {
			switch (this.mode) {
			case "autoplaylists":
				this.save = function () {
					_.save(JSON.stringify(this.data, this.replacer), this.filename);
				}
				
				this.replacer = function (key, value) {
					if (key == "width")
						return undefined;
					else
						return value;
				}
				
				this.add = function () {
					if (this.editing)
						return;
					this.editing = true;
					var new_name = _.input("Enter autoplaylist name", panel.name, "");
					if (new_name == "")
						return this.editing = false;
					var new_query = _.input("Enter autoplaylist query", panel.name, "");
					if (new_query == "")
						return this.editing = false;
					var new_sort = _.input("Enter sort pattern\n\n(optional)", panel.name, "");
					var new_forced = (new_sort.length > 0 ? WshShell.popup("Force sort?", 0, panel.name, popup.question + popup.yes_no) : popup.no) == popup.yes;
					this.data.push({
						name : new_name,
						query : new_query,
						sort : new_sort,
						forced : new_forced
					});
					this.edit_done(this.data.length - 1);
					this.editing = false;
				}
				
				this.edit = function (x, y) {
					var z = this.index;
					_.tt("");
					var m = window.CreatePopupMenu();
					m.AppendMenuItem(MF_STRING, 1, "Rename...");
					m.AppendMenuItem(MF_STRING, 2, "Edit query...");
					m.AppendMenuItem(MF_STRING, 3, "Edit sort pattern...");
					m.AppendMenuItem(MF_STRING, 4, "Force Sort");
					m.CheckMenuItem(4, this.data[z].forced);
					m.AppendMenuSeparator();
					m.AppendMenuItem(MF_STRING, 5, "Delete");
					this.editing = true;
					this.hover = false;
					window.RepaintRect(this.x + this.w - 20, this.y, 20, this.h);
					var idx = m.TrackPopupMenu(x, y);
					switch (idx) {
					case 1:
						var new_name = _.input("Rename autoplaylist", panel.name, this.data[z].name);
						if (new_name == "" || new_name == this.data[z].name)
							break;
						this.data[z].name = new_name;
						this.edit_done(z);
						break;
					case 2:
						var new_query = _.input("Enter autoplaylist query", panel.name, this.data[z].query);
						if (new_query == "" || new_query == this.data[z].query)
							break;
						this.data[z].query = new_query;
						this.edit_done(z);
						break;
					case 3:
						var new_sort = _.input("Enter sort pattern\n\n(optional)", panel.name, this.data[z].sort);
						if (new_sort == this.data[z].sort)
							break;
						this.data[z].sort = new_sort;
						if (new_sort.length > 0)
							this.data[z].forced = WshShell.popup("Force sort?", 0, panel.name, popup.question + popup.yes_no) == popup.yes;
						this.edit_done(z);
						break;
					case 4:
						this.data[z].forced = !this.data[z].forced;
						this.edit_done(z);
						break;
					case 5:
						this.deleted_items.unshift(this.data[z]);
						this.data.splice(z, 1);
						this.save();
						this.update();
						break;
					}
					this.editing = false;
					m.Dispose();
				}
				
				this.edit_done = function (z) {
					this.save();
					this.run_query(this.data[z].name, this.data[z].query, this.data[z].sort, this.data[z].forced);
					this.update();
				}
				
				this.run_query = function (n, q, s, f) {
					var i = 0;
					while (i < fb.PlaylistCount) {
						if (fb.GetPlaylistName(i) == n)
							fb.RemovePlaylist(i);
						else
							i++;
					}
					fb.CreateAutoPlaylist(fb.PlaylistCount, n, q, s, f);
					fb.ActivePlaylist = fb.PlaylistCount - 1;
				}
				
				_.createFolder(folders.settings);
				this.hover = false;
				this.editing = false;
				this.deleted_items = [];
				this.guifx_font = _.gdiFont(guifx.font, 12, 0);
				this.filename = folders.settings + "autoplaylists.json";
				this.update();
				break;
			case "echonest":
				_.createFolder(folders.data);
				_.createFolder(folders.artists);
				this.ua = "";
				this.echonest_modes = ["news", "reviews", "blogs"];
				this.echonest_mode = window.GetProperty("2K3.LIST.ECHONEST.MODE", 0);
				this.font = _.gdiFont(panel.fonts.name, 12);
				break;
			case "lastfm_info":
				_.createFolder(folders.data);
				_.createFolder(folders.data + "lastfm\\");
				_.createFolder(folders.artists);
				_.createFolder(folders.settings);
				this.ua = lastfm.ua;
				this.mode = "lastfm_info";
				this.lastfm_mode = window.GetProperty("2K3.LIST.LASTFM.MODE", 0); //0 artist 1 charts 2 recommendations
				this.lastfm_artist_methods = [{
						method : "artist.getSimilar",
						json : "similarartists.artist",
						display : "similar artists"
					}, {
						method : "artist.getTopTags",
						json : "toptags.tag",
						display : "top tags"
					}, {
						method : "artist.getTopFans",
						json : "topfans.user",
						display : "top fans"
					}, {
						method : "artist.getTopAlbums",
						json : "topalbums.album",
						display : "top albums"
					}, {
						method : "artist.getTopTracks",
						json : "toptracks.track",
						display : "top tracks"
					}
				];
				this.lastfm_artist_method = window.GetProperty("2K3.LIST.LASTFM.ARTIST.METHOD", 0);
				this.lastfm_charts_methods = [{
						method : "user.getTopArtists",
						json : "topartists.artist",
						display : "artist"
					}, {
						method : "user.getTopAlbums",
						json : "topalbums.album",
						display : "album"
					}, {
						method : "user.getTopTracks",
						json : "toptracks.track",
						display : "track"
					}
				];
				this.lastfm_charts_method = window.GetProperty("2K3.LIST.LASTFM.CHARTS.METHOD", 0);
				this.lastfm_charts_periods = [{
						period : "overall",
						display : "overall"
					}, {
						period : "7day",
						display : "last 7 days"
					}, {
						period : "1month",
						display : "1 month"
					}, {
						period : "3month",
						display : "3 month"
					}, {
						period : "6month",
						display : "6 month"
					}, {
						period : "12month",
						display : "12 month"
					}
				];
				this.lastfm_charts_period = window.GetProperty("2K3.LIST.LASTFM.CHARTS.PERIOD", 0);
				this.lastfm_charts_colour = window.GetProperty("2K3.LIST.LASTFM.CHARTS.COLOUR", "60-60-60");
				if (this.lastfm_mode > 0)
					this.update();
				break;
			case "musicbrainz":
				this.mb_parse_urls = _.bind(function (item) {
					url = decodeURIComponent(item.url.resource);
					image = "external";
					if (item.type == "official homepage") {
						image = "home";
					} else {
						_.forEach(this.mb_images_keys, function (item) {
							if (url.indexOf(item) > -1) {
								image = item;
								return false;
							}
						});
					}
					return {
						name : url,
						url : url,
						width : _.textWidth(url, panel.fonts.normal),
						image : image
					};
				}, this);
				
				_.createFolder(folders.data);
				_.createFolder(folders.artists);
				this.ua = "foobar2000_wsh_panel_mod_musicbrainz +https://github.com/19379/wsh_marc2003";
				this.mb_mode = window.GetProperty("2K3.LIST.MUSICBRAINZ.MODE", 0); //0 releases 1 links
				this.mb_icons = window.GetProperty("2K3.LIST.MUSICBRAINZ.SHOW.ICONS", true);
				this.mb_id = "";
				this.mb_images = {
					"wikipedia.org" : gdi.Image(folders.images + "mb\\wikipedia.png"),
					"wikidata.org" : gdi.Image(folders.images + "mb\\wikidata.png"),
					"youtube.com" : gdi.Image(folders.images + "mb\\youtube.png"),
					"discogs.com" : gdi.Image(folders.images + "mb\\discogs.png"),
					"last.fm" : gdi.Image(folders.images + "mb\\lastfm.png"),
					"facebook.com" : gdi.Image(folders.images + "mb\\facebook.png"),
					"viaf.org" : gdi.Image(folders.images + "mb\\viaf.png"),
					"bbc.co.uk" : gdi.Image(folders.images + "mb\\bbc.png"),
					"twitter.com" : gdi.Image(folders.images + "mb\\twitter.png"),
					"allmusic.com" : gdi.Image(folders.images + "mb\\allmusic.png"),
					"soundcloud.com" : gdi.Image(folders.images + "mb\\soundcloud.png"),
					"myspace.com" : gdi.Image(folders.images + "mb\\myspace.png"),
					"imdb.com" : gdi.Image(folders.images + "mb\\imdb.png"),
					"plus.google.com" : gdi.Image(folders.images + "mb\\google_plus.png"),
					"lyrics.wikia.com" : gdi.Image(folders.images + "mb\\lyrics_wikia.png"),
					"flickr.com" : gdi.Image(folders.images + "mb\\flickr.png"),
					"secondhandsongs.com" : gdi.Image(folders.images + "mb\\secondhandsongs.png"),
					"vimeo.com" : gdi.Image(folders.images + "mb\\vimeo.png"),
					"rateyourmusic.com" : gdi.Image(folders.images + "mb\\rateyourmusic.png"),
					"instagram.com" : gdi.Image(folders.images + "mb\\instagram.png"),
					"tumblr.com" : gdi.Image(folders.images + "mb\\tumblr.png"),
					"decoda.com" : gdi.Image(folders.images + "mb\\decoda.png"),
					"home" : gdi.Image(folders.images + "mb\\home.png"),
					"external" : gdi.Image(folders.images + "mb\\external.png"),
					"musicbrainz" : gdi.Image(folders.images + "mb\\musicbrainz.png")
				};
				this.mb_images_keys = _.keys(this.mb_images);
				break;
			case "properties":
				this.add_meta = function (f) {
					for (var i = 0; i < f.MetaCount; i++) {
						var name = f.MetaName(i);
						var num = panel.tf("$meta_num(" + name + ")");
						for (var j = 0; j < num; j++) {
							var value = panel.tf("$meta(" + name + "," + j +")").replace(/\s{2,}/g, " ");
							this.data.push({
								name : (num == 1 || j == 0 ? name.toUpperCase() : ""),
								value : value,
								query : name.toLowerCase() + (num == 1 ? " IS " : " HAS ") + value
							});
						}
					}
				}
				
				this.add_location = function () {
					this.add();
					var names = ["FOLDER NAME", "FILE PATH", "SUBSONG INDEX", "FILE SIZE", "LAST MODIFIED"];
					var values = [panel.tf("$directory_path(%path%)"), panel.metadb.Path, panel.metadb.Subsong, panel.tf("[%filesize_natural%]"), panel.tf("[%last_modified%]")];
					var queries = ["\"$directory_path(%path%)\" IS ", "%path% IS ", "%subsong% IS ", "%filesize_natural% IS ", "%last_modified% IS "];
					for (var i = 0; i < 5; i++) {
						this.data.push({
							name : names[i],
							value : values[i],
							query : queries[i] + values[i]
						});
					}
				}
				
				this.add_properties = function (f) {
					this.add();
					this.data.push({
						name : "DURATION",
						value : _.formatLength(panel.metadb.Length, 3) + " " + _.samples(panel.metadb),
						query : "%length% IS " + _.formatLength(panel.metadb.Length)
					});
					for (var i = 0; i < f.InfoCount; i++) {
						var name = f.InfoName(i);
						var value = panel.tf("%__" + name + "%");
						this.data.push({
							name : name.toUpperCase(),
							value : value,
							query : "%__" + name.toLowerCase() + "% IS " + value
						});
					}
				}
				
				this.add_customdb = function () {
					if (utils.CheckComponent("foo_customdb", true)) {
						this.add();
						this.add(["LASTFM_PLAYCOUNT_DB", "LASTFM_LOVED_DB"]);
					}
				}
				
				this.add_stats = function () {
					if (utils.CheckComponent("foo_playcount", true)) {
						this.add();
						this.add(["PLAY_COUNT", "FIRST_PLAYED", "LAST_PLAYED", "ADDED", "RATING"]);
					}
				}
				
				this.add = function (names) {
					if (names) {
						this.data.push.apply(this.data, _.map(names, function (item) {
							return {
								name : item,
								value : panel.tf("[%" + item + "%]"),
								query : "%" + item + "% IS " + panel.tf("[%" + item + "%]")
							};
						}));
					} else {
						this.data.push({"name" : "", "value" : "", "query" : ""});
					}
				}
				
				this.mode = "properties";
				break;
			}
		}
		
		panel.list_objects.push(this); //required for font change shiznit
		this.mode = mode;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.mx = 0;
		this.my = 0;
		this.index = 0;
		this.offset = 0;
		this.items = 0;
		this.text_x = 0;
		this.artist = "";
		this.filename = "";
		this.up_btn = new _.sb(guifx.up, this.x, this.y, 15, 15, _.bind(function () { return this.offset > 0; }, this), _.bind(function () { this.wheel(1); }, this));
		this.down_btn = new _.sb(guifx.down, this.x, this.y, 15, 15, _.bind(function () { return this.offset < this.items - this.rows; }, this), _.bind(function () { this.wheel(-1); }, this));
		this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		this.init();
	}
});