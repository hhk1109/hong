package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 玩家金币变更操作日志实体，对应数据库 coin_log 表。
 * 每一笔管理员金币调整都会记录，便于审计追踪。
 */
@TableName("coin_log")
public class CoinLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 目标玩家账号 */
    private String account;

    /** 目标玩家农夫名（冗余，便于审计） */
    private String farmerName;

    /** 操作管理员账号 */
    private String operator;

    /** 调整模式：delta-增减 / target-目标值 */
    private String mode;

    /** 输入值：delta 时为增减量，target 时为目标金币数 */
    private Long changeValue;

    /** 变更前金币 */
    private Long beforeGold;

    /** 变更后金币 */
    private Long afterGold;

    /** 实际变动量 = after - before */
    private Long diff;

    /** 修改原因（必填） */
    private String reason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }
    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public Long getChangeValue() { return changeValue; }
    public void setChangeValue(Long changeValue) { this.changeValue = changeValue; }
    public Long getBeforeGold() { return beforeGold; }
    public void setBeforeGold(Long beforeGold) { this.beforeGold = beforeGold; }
    public Long getAfterGold() { return afterGold; }
    public void setAfterGold(Long afterGold) { this.afterGold = afterGold; }
    public Long getDiff() { return diff; }
    public void setDiff(Long diff) { this.diff = diff; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
