package com.fenglin.springboottest.common;

/**
 * 统一返回体，字段与前端约定一致：{ code, data, message }
 * 成功时 code = 200
 */
public class Result<T> {

    /** 状态码：200 成功，其它为业务失败 */
    private int code;
    /** 业务数据 */
    private T data;
    /** 提示信息 */
    private String message;

    public Result() {
    }

    public Result(int code, T data, String message) {
        this.code = code;
        this.data = data;
        this.message = message;
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(200, data, "ok");
    }

    public static <T> Result<T> success(T data, String message) {
        return new Result<>(200, data, message);
    }

    public static <T> Result<T> fail(int code, String message) {
        return new Result<>(code, null, message);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
