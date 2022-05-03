select
	op.PAT_ID
	,id.IDENTITY_ID as uid
	,pt.PAT_NAME
	,sex.ABBR as gender
	,pt.BIRTH_DATE
	,op.ORDER_PROC_ID
	,ce.PROC_CODE
	,op.DESCRIPTION
	,op.RESULT_TIME
	,ora_final.USER_ID as finalizingUserId
	,ora_prelim.USER_ID as prelimUserId
from
	ORDER_PROC op
	join PATIENT pt on op.PAT_ID = pt.PAT_ID
	join ZC_SEX sex on pt.SEX_C = sex.RCPT_MEM_SEX_C
	join IDENTITY_ID id on op.PAT_ID = id.PAT_ID and id.IDENTITY_TYPE_ID = 105 -- uid
	join CLARITY_EAP ce on ce.PROC_ID = op.PROC_ID
	join ORDER_RAD_AUDIT ora_final on op.ORDER_PROC_ID = ora_final.ORDER_PROC_ID and ora_final.AUDIT_ORDER_STAT_C = 99 -- finalized
	left join ORDER_RAD_AUDIT ora_prelim on op.ORDER_PROC_ID = ora_prelim.ORDER_PROC_ID and ora_prelim.AUDIT_ORDER_STAT_C = 70 -- prelim
where
	ce.PROC_CODE in (
		'93307','93308','93312','93313','93314','93320',
		'93321','93325','93350','93303','93304','93315',
		'93316','93317','CAR03','CAR05','CAR07','CAR08',
		'CAR13','CAR14','1000100','1000101','1000102',
		'1000103','93306','93351','CVECH01','CVECH02',
		'CATHIMAGE02','CVECH25','CVECH16','CVTEE07',
		'CVTEE11','93355','PROC5773','PROC4643','PROC4679',
		'PROC4680','PROC4681','PROC4682','PROC4683','PROC1047',
		'PROC1100','PROC1101','PROC1102','PROC1103','PROC1104',
		'PROC1105','PROC1106','PROC6791','PROC6872','PROC6873',
		'PROC6879','ECHO11'
	)
	and op.RESULT_TIME between @startDate and @endDate
order by op.ORDER_PROC_ID desc