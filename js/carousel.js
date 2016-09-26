//前加一个分号“；”避免前面加载的js库未正确闭合，防止报错
;(function($){
	var Carousel = function(poster){  //新建Carousel类，在类中建立prototype方法
       var self= this;
      //保存单个旋转木马对象
      this.poster = poster;
      this.posterItemMain = poster.find("ul.poster-list");
      this.nextBtn = poster.find("div.poster-next-btn");
      this.prevBtn = poster.find("div.poster-prev-btn");
      this.posterItems = poster.find("li.poster-item");
      this.posterFirstItem  = this.posterItems.first();
	  this.posterLastItem  = this.posterItems.last();
      this.rotateFlag   = true;
      //默认配置参数
      this.setting = {
			      	"width":1000,  //幻灯片的宽度
				    "height":270,   //幻灯片的高度
				    "posterWidth":640,  //第一帧的宽度
				    "posterHeight":270,  //第一帧的高度
				    "scale":0.9,       //记录显示比例关系
				    "speed":500,
				    "delay":5000,
				    "verticalAligan":"middle"
				};
      //如果有人工配置参数，将其扩展到默认参数JSon中，取代默认参数
	  $.extend(this.setting,this.getSetting());
      
      //设置配置参数
      this.setSettingValue();
      this.setPosterPos();

      //左旋转按钮
			this.nextBtn .click(function(){
				if(self.rotateFlag){
					self.rotateFlag = false;
					self.carouseRotate("left");
				};
			});
			//右旋转按钮
			this.prevBtn .click(function(){
				if(self.rotateFlag){
					self.rotateFlag = false;
					self.carouseRotate("right");
				};
			});
      //是否开启自动播放
      if(this.setting.autoPlay){
			this.autoPlay();
			this.poster.hover(function(){
							window.clearInterval(self.timer);
							},function(){
							self.autoPlay();
							});
			
		};
	};
	//构造Carousel的原型
	Carousel.prototype={
		autoPlay:function(){
			var self = this;
			this.timer = window.setInterval(function(){
				self.nextBtn.click();
			},this.setting.delay);

		},
		//旋转
		carouseRotate:function(dir){
			var _this_  = this;
			var zIndexArr = [];
			//左旋转
			if(dir === "left"){
				this.posterItems .each(function(){
					var self = $(this),
						   prev = self.prev().get(0)?self.prev():_this_.posterLastItem,
						   width = prev.width(),
						   height =prev.height(),
						   zIndex = prev.css("zIndex"),
						   opacity = prev.css("opacity"),
						   left = prev.css("left"),
						   top = prev.css("top");
							zIndexArr.push(zIndex);	
						   self.animate({
							   					width:width,
												height:height,
												//zIndex:zIndex,
												opacity:opacity,
												left:left,
												top:top
												},_this_.setting.speed,function(){
													_this_.rotateFlag = true;
												});
				});
				//zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
			}else if(dir === "right"){//右旋转
				this.posterItems .each(function(){
					var self = $(this),
						   next = self.next().get(0)?self.next():_this_.posterFirstItem,
						   width = next.width(),
						   height =next.height(),
						   zIndex = next.css("zIndex"),
						   opacity = next.css("opacity"),
						   left = next.css("left"),
						   top = next.css("top");
						   zIndexArr.push(zIndex);	
						   self.animate({
							   					width:width,
												height:height,
												//zIndex:zIndex,
												opacity:opacity,
												left:left,
												top:top
												},_this_.setting.speed,function(){
													_this_.rotateFlag = true;
												});
	
				});
				//zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
			};
		},

		//设置剩余的图片的位置关系
		setPosterPos:function(){
			var self = this;
			var sliceItems = this.posterItems.slice(1);
			    sliceSize = sliceItems.size()/2;
			    rightSlice = sliceItems.slice(0,sliceSize);
			    level =Math.floor(this.posterItems.size()/2);
			    leftSlice = sliceItems.slice(sliceSize);  

			   var rw = this.setting.posterWidth,
			       rh = this.setting.posterHeight,
			       gap = ((this.setting.width-this.setting.posterWidth)/2)/level;
			       
			       var firstLeft = (this.setting.width-this.setting.posterWidth)/2;
			   	       fixOffsetLeft = firstLeft+rw; 
			   	       
			   //设置右边帧的位置关系和宽度高度值
			   rightSlice.each(function(i){
			   	level--;
			   	rw = rw*self.setting.scale;
			   	rh = rh*self.setting.scale;
			   	var j = i;
			   	  $(this).css({
			   	  	zIndex:level,
			   	  	width:rw,
			   	  	height:rh,
			   	  	opacity:1/(++j),
			   	  	left:fixOffsetLeft+(++i)*gap-rw,
			   	  	top:(self.setting.height-rh)/2
			   	  });

			   });
			   //取到右边最后一帧的宽高；
	   	       var lw = rightSlice.last().width();
	       	       lh = rightSlice.last().height();
	       	       oloop = Math.floor(this.posterItems.size()/2);
			   //设置左边的位置关系
			   leftSlice.each(function(i){
			   	$(this).css({
			   	  	zIndex:i,
					width:lw,
					height:lh,
					opacity:1/oloop,
					left:i*gap,
					top:(self.setting.height-lh)/2 
			   	  });
			   	lw = lw/self.setting.scale;
			   	lh = lh/self.setting.scale;
			   	oloop--;
			   }); 

		},
		//设置配置参数去控制基本的宽度和高度
		setSettingValue:function(){
			this.poster.css({
				width:this.setting.width,
				height:this.setting.height
			});
			this.posterItemMain.css({
				width:this.setting.width,
				height:this.setting.height
			});
			//计算切换上下按钮的宽度
			var w = (this.setting.width-this.setting.posterWidth)/2;
			//向上切换按钮样式
			this.nextBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2)
			});
			//向下切换按钮样式
			this.prevBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2)
			});
			//第一帧样式
			this.posterFirstItem.css({
				width:this.setting.posterWidth,
				height:this.setting.posterHidth,
				left:w,
				zIndex:Math.floor(this.posterItems.size()/2)
			});
		},

		//获取人工配置参数
		getSetting:function(){
			var setting  = this.poster.attr("data-setting");
			if(setting&&setting!=""){
				return $.parseJSON(setting);//转化为JSon对象并返回；
			}else{
				return {};
		     };
		}

	};
	   //Carousel类上的init方法，用于初始化所有页面中J_Poster集合
	Carousel.init = function(posters){
		var _this_ = this;
		posters.each(function(){
			new _this_($(this));   //this-->DOM节点
		});
	};
	window["Carousel"] = Carousel;  //将Carousel注册到全局变量中
})(jQuery);