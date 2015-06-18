"use strict";

class FST extends require("stream").PassThrough {
	constructor(options){
		super(options);
		if(options && options.match && options.replacement){
			var tail, cross_chunk_length, rematch, replacement;
			switch(typeof options.match){
				case "string":
					cross_chunk_length = options.match.length;
					rematch = new RegExp(options.match, "g");
				break;
				case "object":
					if(options.match instanceof RegExp){
						cross_chunk_length = Math.max(0, Math.min(Number(options.cross_length) || 100, 100));
						rematch = new RegExp(options.match.source,
							"g" +
							(options.match.ignoreCase ? "i" : "") +
							(options.match.multiline ? "m" : "")
						);
					}
				break;
			}
			switch(typeof options.replacement){
				case "string":
				case "function":
					replacement = options.replacement;
				break;
			}
			if(rematch && replacement){
				this._transform = function(buf, enc, cb){
					var tmp = ((tail ? tail : "") + buf.toString("utf8"));
					var tail = tmp.split(rematch).pop().slice(- cross_chunk_length);
					this.push(
						tmp.slice(0, - tail.length).replace(rematch, replacement),
						"utf8"
					);
					cb();
				};
				this._flush = function(cb){
					if(tail){
						this.push(tail, "utf8");
						tail = null;
					}
					cb();
				};
			}
		}
	}
}

FST.ReplaceTranform = FST;
module.exports = FST;