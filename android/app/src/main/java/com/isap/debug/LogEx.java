package com.isap.debug;

import android.util.Log;

public class LogEx {

	private static final String _preMsg = "JC+v2: ";
	
//	public static void d(String tag, String msg) { Log.d(tag, _preMsg + msg); }
//	public static void i(String tag, String msg) { Log.i(tag, _preMsg + msg); }
//	public static void w(String tag, String msg) { Log.w(tag, _preMsg + msg); }
//	public static void e(String tag, String msg) { Log.e(tag, _preMsg + msg); }
//	public static void v(String tag, String msg) { Log.v(tag, _preMsg + msg); }
	
	// if you don't want to have debug message then use following function instead of functions above.
	public static void d(String tag, String msg) {  }
	public static void i(String tag, String msg) {  }
	public static void w(String tag, String msg) {  }
	public static void e(String tag, String msg) {  }
	public static void v(String tag, String msg) {  }
}
