package com.fenglin.springboottest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.io.Serializable;

/**
 * 管理员调整玩家金币请求体。
 * mode=delta 时 value 为增减量（可正可负，不能为 0）；
 * mode=target 时 value 为调整后的目标金币数（>=0）。
 */
public class CoinChangeRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 调整模式：delta 增减 / target 目标值 */
    @NotBlank(message = "调整模式不能为空")
    @Pattern(regexp = "delta|target", message = "调整模式只能是 delta 或 target")
    private String mode;

    /** 数值：增减量或目标金币数 */
    @NotNull(message = "数值不能为空")
    private Long value;

    /** 修改原因（必填，便于审计追踪） */
    @NotBlank(message = "修改原因不能为空")
    @Size(max = 255, message = "修改原因过长（最多 255 字）")
    private String reason;

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public Long getValue() {
        return value;
    }

    public void setValue(Long value) {
        this.value = value;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
