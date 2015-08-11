_.mixin({
	text : function (mode, x, y, w, h) {
		this.size = function () {
			this.rows = _.floor((this.h - 30) / panel.row_height);
			this.up_btn.x = this.x + _.round((this.w - 15) / 2);
			this.down_btn.x = this.up_btn.x;
			this.up_btn.y = this.y;
			this.down_btn.y = this.y + this.h - 15;
			this.update();
		}
		
		this.paint = function (gr) {
			for (var i = 0; i < Math.min(this.rows, this.lines.length); i++) {
				gr.GdiDrawText(this.lines[i + this.offset], this.fixed ? panel.fonts.fixed : panel.fonts.normal, panel.colours.text, this.x, 15 + this.y + (i * panel.row_height), this.w, panel.row_height, LEFT);
			}
			this.up_btn.paint(gr, panel.colours.text);
			this.down_btn.paint(gr, panel.colours.text);
		}
		
		this.metadb_changed = function () {
			if (panel.metadb) {
				switch (this.mode) {
				case "allmusic":
					var temp_artist = panel.tf(this.allmusic_artist_tf);
					var temp_album = panel.tf(this.allmusic_album_tf);
					if (this.artist == temp_artist && this.album == temp_album)
						return;
					this.artist = temp_artist;
					this.album = temp_album;
					this.filename = panel.new_artist_folder(this.artist) + "allmusic." + _.fbSanitise(this.album) + ".json";
					this.content = "";
					this.allmusic_url = false;
					if (_.isFile(this.filename)) {
						var data = _.jsonParse(_.open(this.filename));
						this.content = data[0];
						//content is static so only check for updates if no review found previously
						if (this.content.length == 0 && _.fileExpired(this.filename, ONE_DAY))
							this.get();
					} else {
						this.get();
					}
					break;
				case "lastfm_bio":
					var temp_artist = panel.tf(panel.artist_tf);
					if (this.artist == temp_artist)
						return;
					this.artist = temp_artist;
					this.content = "";
					this.filename = panel.new_artist_folder(this.artist) + "bio.lastfm.json";
					if (_.isFile(this.filename)) {
						var data = _.jsonParse(_.open(this.filename));
						this.content = data[0];
						if (_.fileExpired(this.filename, ONE_DAY))
							this.get();
					} else {
						this.get();
					}
					break;
				case "text_reader":
					var temp_filename = panel.tf(this.filename_tf);
					if (this.filename == temp_filename)
						return;
					this.filename = temp_filename;
					this.content = "";
					if (_.isFolder(this.filename)) { //yes really!
						var folder = this.filename + "\\";
						var files = _.getFiles(folder, this.exts);
						this.content = _.open(files[0]);
					} else if (_.isFile(this.filename)) {
						this.content = _.open(this.filename);
					}
					this.content = this.content.replace(/\t/g, "    ");
					break;
				}
				this.update();
				window.Repaint();
			}
		}
		
		this.trace = function (x, y) {
			return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		}
		
		this.wheel = function (s) {
			if (this.trace(this.mx, this.my)) {
				if (this.lines.length > this.rows) {
					var offset = this.offset - (s * 5);
					if (offset < 0)
						offset = 0;
					if (offset + this.rows > this.lines.length)
						offset = this.lines.length - this.rows;
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
			switch (true) {
			case !this.trace(x, y):
				window.SetCursor(IDC_ARROW);
				return false;
			case this.up_btn.move(x, y):
			case this.down_btn.move(x, y):
				break;
			default:
				window.SetCursor(IDC_ARROW);
				break;
			}
			return true;
		}
		
		this.lbtn_up = function (x, y) {
			if (this.trace(x, y)) {
				this.up_btn.lbtn_up(x, y);
				this.down_btn.lbtn_up(x, y);
				return true;
			} else {
				return false;
			}
		}
		
		this.rbtn_up = function (x, y) {
			switch (this.mode) {
			case "allmusic":
				panel.s10.AppendMenuItem(MF_STRING, 5000, "Artist...");
				panel.s10.AppendMenuItem(MF_STRING, 5001, "Album...");
				panel.s10.AppendTo(panel.m, MF_STRING, "Field remapping");
				panel.m.AppendMenuSeparator();
				this.cb = _.getClipboardData();
				panel.m.AppendMenuItem(panel.metadb && _.isString(this.cb) && _.tagged(this.artist) && _.tagged(this.album) ? MF_STRING : MF_GRAYED, 5010, "Paste text from clipboard");
				panel.m.AppendMenuSeparator();
				break;
			case "lastfm_bio":
				panel.m.AppendMenuItem(panel.metadb ? MF_STRING : MF_GRAYED, 5100, "Force update");
				panel.m.AppendMenuSeparator();
				break;
			case "text_reader":
				panel.m.AppendMenuItem(MF_STRING, 5200, "Refresh");
				panel.m.AppendMenuSeparator();
				panel.m.AppendMenuItem(MF_STRING, 5210, "Custom title...");
				panel.m.AppendMenuItem(MF_STRING, 5220, "Custom path...");
				panel.m.AppendMenuSeparator();
				panel.m.AppendMenuItem(MF_STRING, 5230, "Fixed width font");
				panel.m.CheckMenuItem(5230, this.fixed);
				panel.m.AppendMenuSeparator();
				break;
			}
			panel.m.AppendMenuItem(_.isFile(this.filename) ? MF_STRING : MF_GRAYED, 5999, "Open containing folder");
			panel.m.AppendMenuSeparator();
		}
		
		this.rbtn_up_done = function (idx) {
			switch (idx) {
			case 5000:
				this.allmusic_artist_tf = _.input("The default is %album artist%\n\nYou can use the full foobar2000 title formatting syntax here.", "Artist field remapping", this.allmusic_artist_tf);
				if (this.allmusic_artist_tf == "")
					this.allmusic_artist_tf = "%album artist%";
				window.SetProperty("2K3.TEXT.ALLMUSIC.ARTIST.TF", this.allmusic_artist_tf);
				panel.item_focus_change();
				break;
			case 5001:
				this.allmusic_album_tf = _.input("The default is %album%\n\nYou can use the full foobar2000 title formatting syntax here.", "Album field remapping", this.allmusic_album_tf);
				if (this.allmusic_album_tf == "")
					this.allmusic_album_tf = "%album%";
				window.SetProperty("2K3.TEXT.ALLMUSIC.ALBUM.TF", this.allmusic_album_tf);
				panel.item_focus_change();
				break;
			case 5010:
				_.save(JSON.stringify([this.cb]), this.filename);
				this.artist = "";
				panel.item_focus_change();
				break;
			case 5100:
				this.get();
				break;
			case 5200:
				this.filename = "";
				panel.item_focus_change();
				break;
			case 5210:
				this.title_tf = _.input("You can use full title formatting here.", panel.name, this.title_tf);
				window.SetProperty("2K3.TEXT.TITLE.TF", this.title_tf);
				window.Repaint();
				break;
			case 5220:
				this.filename_tf = _.input("Use title formatting to specify a path to a text file. eg: $directory_path(%path%)\\info.txt\n\nIf you prefer, you can specify just the path to a folder and the first txt or log file will be used.", panel.name, this.filename_tf);
				window.SetProperty("2K3.TEXT.FILENAME.TF", this.filename_tf);
				panel.item_focus_change();
				break;
			case 5230:
				this.fixed = !this.fixed;
				window.SetProperty("2K3.TEXT.FONTS.FIXED", this.fixed);
				this.update();
				window.RepaintRect(this.x, this.y, this.w, this.h);
				break;
			case 5999:
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
			this.offset = 0;
			switch (true) {
			case this.w < 100 || this.content.length == 0:
				this.lines = [];
				break;
			case this.fixed:
				this.lines = this.content.split("\n");
				break;
			default:
				this.lines = _.lineWrap(this.content, panel.fonts.normal, this.w);
				break;
			}
		}
		
		this.get = function () {
			var url, f = this.filename;
			switch (this.mode) {
			case "allmusic":
				if (this.allmusic_url) {
					url = this.allmusic_url;
				} else {
					if (!_.tagged(this.artist) || !_.tagged(this.album))
						return;
					url = "http://www.allmusic.com/search/albums/" + encodeURIComponent(this.album + (this.artist.toLowerCase() == "various artists" ? "" : " " + this.artist));
				}
				break;
			case "lastfm_bio":
				if (!_.tagged(this.artist))
					return;
				url = "http://www.last.fm/music/" + encodeURIComponent(this.artist) + "/+wiki";
				break;
			default:
				return;
			}
			this.xmlhttp.open("GET", url, true);
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
			switch (this.mode) {
			case "allmusic":
				if (this.allmusic_url) {
					this.allmusic_url = false;
					var content = _(_.getElementsByTagName(this.xmlhttp.responsetext, "div"))
						.filter({"itemprop" : "reviewBody"})
						.map("innerText")
						.stripTags([0])
						.value();
					panel.console(content.length > 0 ? "A review was found and saved." : "No review was found on the page for this album.");
					_.save(JSON.stringify([content]), f);
					this.artist = "";
					panel.item_focus_change();
				} else {
					this.allmusic_url = "";
					var artist, album, divs, url, temp;
					_(_.getElementsByTagName(this.xmlhttp.responsetext, "li"))
						.filter({"className" : "album"})
						.forEach(function (item) {
							divs = item.getElementsByTagName("div");
							album = divs[2].getElementsByTagName("a")[0].innerText;
							url = divs[2].getElementsByTagName("a")[0].href;
							temp = divs[3].getElementsByTagName("a");
							if (temp.length > 0)
								artist = temp[0].innerText;
							else
								artist = "various artists";
							if (this.is_match(artist, album)) {
								this.allmusic_url = url;
								return false;
							}
						}, this)
						.value();
					if (this.allmusic_url.length > 0) {
						panel.console("A page was found for \"" + this.album + "\". Now checking for review...");
						this.get();
					} else {
						panel.console("Could not match artist/album on the Allmusic website.");
						_.save(JSON.stringify([""]), f);
					}
				}
				break;
			case "lastfm_bio":
				var content = _(_.getElementsByTagName(this.xmlhttp.responsetext, "div"))
					.filter({"id" : "wiki"})
					.map("innerText")
					.stripTags([0])
					.value();
				_.save(JSON.stringify([content]), f);
				this.artist = "";
				panel.item_focus_change();
				break;
			}
		}
		
		this.header_text = function () {
			switch (this.mode) {
			case "allmusic":
				return panel.tf("%album artist%[ - %album%]");
				break;
			case "lastfm_bio":
				return this.artist;
				break;
			case "text_reader":
				return panel.tf(this.title_tf);
				break;
			}
		}
		
		this.init = function () {
			switch (this.mode) {
			case "allmusic":
				this.is_match = function (artist, album) {
					return _.amTidy(artist) == _.amTidy(this.artist) && _.amTidy(album) == _.amTidy(this.album);
				}
			
				_.createFolder(folders.data);
				_.createFolder(folders.artists);
				this.allmusic_artist_tf = window.GetProperty("2K3.TEXT.ALLMUSIC.ARTIST.TF", "%album artist%");
				this.allmusic_album_tf = window.GetProperty("2K3.TEXT.ALLMUSIC.ALBUM.TF", "%album%");
				break;
			case "lastfm_bio":
				_.createFolder(folders.data);
				_.createFolder(folders.artists);
				break;
			case "text_reader":
				this.title_tf = window.GetProperty("2K3.TEXT.TITLE.TF", "$directory_path(%path%)");
				this.filename_tf = window.GetProperty("2K3.TEXT.FILENAME.TF", "$directory_path(%path%)");
				this.fixed = window.GetProperty("2K3.TEXT.FONTS.FIXED", true);
				this.exts = "txt|log";
				break;
			}
		}
		
		panel.text_objects.push(this); //required for font change shiznit
		this.mode = mode;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.mx = 0;
		this.my = 0;
		this.offset = 0;
		this.fixed = false;
		this.content = "";
		this.artist = "";
		this.album = "";
		this.filename = "";
		this.up_btn = new _.sb(guifx.up, this.x, this.y, 15, 15, _.bind(function () { return this.offset > 0; }, this), _.bind(function () { this.wheel(1); }, this));
		this.down_btn = new _.sb(guifx.down, this.x, this.y + this.h, 15, 15, _.bind(function () { return this.offset < this.lines.length - this.rows; }, this), _.bind(function () { this.wheel(-1); }, this));
		this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		this.init();
	}
});