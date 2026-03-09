/**
 * @param {String} type 类型
 * @param {Object} [options] 选项
 * @param {String} [options.message] 错误提示信息
 * @param {String} [options.mode] 模式
 * @param {String} [options.version] 版本
 * @returns {{}}
 */
export function useRegexRule(type, options) {
  options = options || {};
  const rule = {};

  switch (type) {
    case "email":
      //邮箱: '90203918@qq.com', 'nbilly@126.com'
      rule.pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      rule.message = options.message || "请填写正确的邮箱地址";
      break;
    case "phone":
      //手机号码
      if (options.mode === "strict") {
        //严谨，根据工信部2019年最新公布的手机号: '008618311006933', '+8617888829981', '19119255642'
        rule.pattern =
          /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/;
      } else {
        //宽松，只要是13,14,15,16,17,18,19开头即可: '008618311006933', '+8617888829981', '19119255642'
        rule.pattern = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
      }
      rule.message = options.message || "请填写正确的手机号码";
      break;
    case "tel":
    case "telephone":
      //座机号码
      if (options.strict === "strict") {
        //严格带区号: '0936-4211235'
        rule.pattern = /^\d{3}-\d{8}$|^\d{4}-\d{7,8}$/;
      } else {
        //可带可不带: '0936-4211235','89076543'
        rule.pattern = /^(?:\d{3}-)?\d{8}$|^(?:\d{4}-)?\d{7,8}$/;
      }
      rule.message = options.message || "请填写正确的座机号码";
      break;
    case "ID": //身份证号码
    case "id":
      if (!options.mode || ["china", "cn"].includes(options.mode?.toLowerCase())) {
        if (options.version?.toLowerCase() === "v1") {
          //一代身份证，(1代,15位数字): '123456991010193'
          rule.pattern = /^[1-9]\d{7}(?:0\d|10|11|12)(?:0[1-9]|[1-2][\d]|30|31)\d{3}$/;
        } else if (options.version?.toLowerCase() === "v2") {
          //二代身份证，(2代,18位数字)最后一位是校验位,可能为数字或字符X: '12345619900101001X'
          rule.pattern =
            /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/;
        } else {
          //兼容一代和二代
          rule.pattern =
            /(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0[1-9]|10|11|12)([0-2]\d|30|31)\d{3}(\d|X|x)$)/;
        }
      } else if (["hk", "hongkong", "xg", "xianggang"].includes(options.mode.toLowerCase())) {
        //香港身份证: 'K034169(1)'
        rule.pattern = /^[a-zA-Z]\d{6}\([\dA]\)$/;
      } else if (["macau", "macao", "mo", "aomen", "am"].includes(options.mode.toLowerCase())) {
        //澳门身份证:'5686611(1)'
        rule.pattern = /^[a-zA-Z]\d{6}\([\dA]\)$/;
      } else if (["taiwan", "tw"].includes(options.mode.toLowerCase())) {
        //台湾身份证: 'U193683453'
        rule.pattern = /^[a-zA-Z][0-9]{9}$/;
      }

      rule.message = options.message || "请填写正确的证件号码";
      break;
    case "passport":
      //护照（包含香港、澳门）: 's28233515', '141234567', '159203084', 'MA1234567', 'K25345719'
      rule.pattern =
        /(^[EeKkGgDdSsPpHh]\d{8}$)|(^(([Ee][a-fA-F])|([DdSsPp][Ee])|([Kk][Jj])|([Mm][Aa])|(1[45]))\d{7}$)/;
      rule.message = options.message || "请填写正确的护照号码";
      break;
    case "credit-code":
    case "uscc":
      //统一社会信用代码: '91230184MA1BUFLT44', '92371000MA3MXH0E3W'
      rule.pattern = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
      rule.message = options.message || "请填写正确的统一社会信用代码";
      break;
    case "bank-account":
    case "bank":
      //银行账号: 6234567890, 6222026006705354217
      //（10到30位, 覆盖对公/私账户, 参考[微信支付](https://pay.weixin.qq.com/wiki/doc/api/xiaowei.php?chapter=22_1)）
      rule.pattern = /^[1-9]\d{9,29}$/;
      rule.message = options.message || "请填写正确的银行账号";
      break;
    case "stock":
      //股票代码(A股): 'sz000858', 'SZ002136', 'sz300675', 'SH600600', 'sh601155'
      rule.pattern = /^(s[hz]|S[HZ])(000[\d]{3}|002[\d]{3}|300[\d]{3}|600[\d]{3}|60[\d]{4})$/;
      rule.message = options.message || "请填写正确的股票代码";
      break;
    case "url":
      //链接
      if (options.mode === "image") {
        //图片链接: 'https://www.abc.com/logo.png'
        rule.pattern = /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i;
      } else if (options.mode === "video") {
        //视频链接:'http://www.abc.com/video/wc.avi'
        rule.pattern =
          /^https?:\/\/(.+\/)+.+(\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4))$/i;
      } else {
        //普通链接: 'www.qq.com', 'https://baidu.com', '360.com:8080/vue/#/a=1&b=2'
        rule.pattern =
          /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
      }
      rule.message = options.message || "请填写正确的链接";
      break;
    case "md5":
      //md5(32位) : '21fe181c5bfc16306a6828c1f7b762e8'
      rule.pattern = /^([a-f\d]{32}|[A-F\d]{32})$/;
      rule.message = options.message || "请填写正确的md5值";
      break;
    case "base64":
      //base64 : 'data:image/gif;base64,xxxx=='
      rule.pattern =
        /^\s*data:(?:[a-z]+\/[a-z0-9-+.]+(?:;[a-z-]+=[a-z0-9-]+)?)?(?:;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)\s*$/i;
      rule.message = options.message || "请填写正确的base64值";
      break;
    case "currency":
    case "money":
      //货币
      if (options.mode === "positive") {
        //只支持正数、不支持校验千分位分隔符: 0.99, 8.99, 666
        rule.pattern = /^\d+(,\d{3})*(\.\d{1,2})?$/;
      } else {
        //支持负数、千分位分隔符: 100, -0.99, 3, 234.32, -1, 900, 235.09, '12,345,678.90'
        rule.pattern = /^-?\d+(,\d{3})*(\.\d{1,2})?$/;
      }
      rule.message = options.message || "请填写正确的货币金额";
      break;
    case "chinese":
      //中文: '正则', '前端'
      rule.pattern =
        /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/;
      rule.message = options.message || "请填写中文字符";
      break;
    case "name":
      //姓名
      if (options.en || options.english) {
        //英文: 'James', 'Kevin Wayne Durant', 'Dirk Nowitzki'
        rule.pattern = /(^[a-zA-Z]{1}[a-zA-Z\s]{0,20}[a-zA-Z]{1}$)/;
      } else {
        //中文: '葛二蛋', '凯文·杜兰特', '德克·维尔纳·诺维茨基'
        rule.pattern = /^(?:[\u4e00-\u9fa5·]{2,16})$/;
      }
      rule.message = options.message || "请填写正确的姓名";
      break;
    case "decimal":
      //小数: '0.0', '0.09'
      rule.pattern = /^\d+\.\d+$/;
      rule.message = options.message || "请填写正确的小数";
      break;
    case "number":
      //数字: 12345678
      rule.pattern = /^\d{1,}$/;
      rule.message = options.message || "请填写正确的数字";
      break;
    case "date":
      //日期: '1990-12-12', '2020-1-1'
      rule.pattern = /^\d{4}(-)(1[0-2]|0?\d)\1([0-2]\d|\d|30|31)$/;
      rule.message = options.message || "请填写正确的日期";
      break;
    case "time":
      //时间: '12:00:00', '23:59:59'
      if (options.mode === "12") {
        //12小时制: '12:00:00', '12:30:00', '12:59:59'
        rule.pattern = /^(?:1[0-2]|0?[1-9]):[0-5]\d:[0-5]\d$/;
      } else {
        rule.pattern = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
      }
      rule.message = options.message || "请填写正确的时间";
      break;
    case "car":
    case "plate-number":
    case "car-number":
      if (options.mode === "green" || options.mode === "newEnergy") {
        //新能源绿牌: '京AD92035', '甘G23459F'
        rule.pattern =
          /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}(([0-9]{5}[DF])|([DF][A-HJ-NP-Z0-9][0-9]{4}))$/;
      } else if (options.mode === "notNewEnergy") {
        //非新能源： '京A00599', '黑D23908'
        rule.pattern =
          /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
      } else {
        //混合: '京A12345D', '京A00599'
        rule.pattern =
          /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}(?:(([0-9]{5}[DF])|([DF][A-HJ-NP-Z0-9][0-9]{4}))|[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1})$/;
      }
      rule.message = options.message || "请填写正确的车牌号";
      break;
    case "version":
      //版本号: 16.3.2
      rule.pattern = /^\d+(?:\.\d+){2}$/;
      rule.message = options.message || "请填写正确的版本号";
      break;
    case "ip":
    case "IP":
      //IP地址
      if (options.mode === "v6" || options.mode === "ipv6") {
        //IPv6地址: '2031:0000:130f:0000:0000:09c0:876a:130b', '[2031:0000:130f:0000:0000:09c0:876a:130b]:8080'
        rule.pattern =
          /^(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))|\[(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))\](?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/i;
      } else {
        //IPv4地址: '172.16.0.0','172.16.0.0:8080', '127.0.0.0', '127.0.0.0:998'
        rule.pattern =
          /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]).){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/;
      }

      rule.message = options.message || "请填写正确的IP地址";
      break;
    case "qq":
      //QQ号: 123456789
      rule.pattern = /^[1-9][0-9]{4,10}$/;
      rule.message = options.message || "请填写正确的QQ号";
      break;
    case "wechat":
      //微信号: 'github666', 'kd_-666'
      //6至20位，以字母开头，字母，数字，减号，下划线
      rule.pattern = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/;
      rule.message = options.message || "请填写正确的微信号";
      break;
    case "alpha-numeric":
    case "numeric-alpha":
      //字母数字: 'abc123', '123abc'
      if (rule.mode === "strict") {
        //同时有数字和英文字母
        rule.pattern = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
      } else {
        rule.pattern = /^[A-Za-z0-9]+$/;
      }
      rule.message = options.message || "请填写字母与数字的组合";
      break;
    case "alpha":
      //字母: 'abc', 'ABC'
      if (options.mode === "lower" || options.mode === "lowercase") {
        //小写字母
        rule.pattern = /^[a-z]+$/;
      } else if (options.mode === "upper" || options.mode === "uppercase") {
        //大写字母
        rule.pattern = /^[A-Z]+$/;
      } else {
        //英文字母
        rule.pattern = /^[a-zA-Z]+$/;
      }
      rule.message = options.message || "请填写正确的字母";
      break;
    case "username":
      //用户名，账号: 'test_name'
      //4到16位（字母，数字，下划线，减号）
      rule.pattern = /^[a-zA-Z0-9_-]{4,16}$/;
      rule.message = options.message || "请填写正确的用户名";
      break;
    case "password":
      //密码: '123456', 'Abcdefg'
      //最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
      rule.pattern = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/;
      rule.message = options.message || "密码必须包含大小写字母、数字和特殊字符，不少于6位";
      break;
    case "zip":
      //邮政编码: '734500', '100101'
      rule.pattern = /^(0[1-7]|1[0-356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[0-5]|8[013-6])\d{4}$/;
      rule.message = options.message || "请填写正确的邮政编码";
      break;
    case "mac":
    case "MAC":
      //MAC 地址: '38:f9:d3:4b:f5:51', '00-0C-29-CA-E4-66'
      rule.pattern = /^((([a-f0-9]{2}:){5})|(([a-f0-9]{2}-){5}))[a-f0-9]{2}$/i;
      rule.message = options.message || "请填写正确的MAC地址";
      break;
  }

  return rule;
}
