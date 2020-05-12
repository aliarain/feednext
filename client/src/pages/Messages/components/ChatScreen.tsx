/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useEffect } from 'react'
import { Avatar, List, Input, Button, Form, Divider, Row, Col, Typography, Popconfirm } from 'antd'
import { fetchMessagesByConversationId } from '@/services/api'
import { API_URL } from '@/../config/constants'
import PageLoading from '@/components/PageLoading'
import { Link } from 'umi'
import { format, parseISO, formatISO } from 'date-fns'
import { DeleteFilled, WarningOutlined } from '@ant-design/icons'

const ChatScreen = (params) => {
	const [messageList, setMessageList] = useState<any[] | null>(null)
	const [form] = Form.useForm()

	useEffect(() => {
		fetchMessagesByConversationId(params.globalState.accessToken, params.conversationId, 0)
			.then(({ data }) => setMessageList(data.attributes.messages.reverse()))

		params.globalState.socketConnection.on('pingMessage', (incMessage: {
			from: string,
			body: string
		}) => {
			if (params.recipientUsername === incMessage.from) {
				setMessageList((messageList: any) => [...messageList, {
					send_by: incMessage.from,
					text: incMessage.body,
					created_at: formatISO(new Date)
				}])
			}
		})
	}, [])

	if (!messageList) return <PageLoading />

	const renderMessages = (item, index) => {
		if (index !== 0	&&
				format(parseISO(messageList[index - 1].created_at), 'dd LLL (p O)') === format(parseISO(item.created_at), 'dd LLL (p O)') &&
				messageList[index - 1].send_by === item.send_by
		) {
			return (
				<List.Item.Meta
					style={{ marginTop: -25 }}
					avatar={<Avatar style={{ visibility: 'hidden' }} />}
					description={<span style={{ color: '#333' }}> {item.text} </span>}
				/>
			)
		}

		return (
			<List.Item.Meta
				avatar={<Avatar src={`${API_URL}/v1/user/pp?username=${item.send_by}`} />}
				title={
					<>
						<Link to={`user/${item.send_by}`} style={{ fontWeight: 'bold', color: '#212121' }}>
							{item.send_by}
						</Link>
						<span style={{ color: 'gray', fontSize: 12 }}> {format(parseISO(item.created_at), 'dd LLL (p O)')} </span>
					</>
				}
				description={<span style={{ color: '#333' }}> {item.text} </span>}
			/>
		)
	}

	const handleMessageSend = async (values: { messageText: string }): Promise<void> => {
		await form.validateFields()

		params.globalState.socketConnection?.emit('sendMessage', {
			recipient: params.recipientUsername,
			body: values.messageText
		})
		setMessageList((messageList: any) => [...messageList, {
			send_by: params.username,
			text: values.messageText,
			created_at: formatISO(new Date)
		}])

		form.resetFields()
	}

	return (
		<div style={{ padding: '10px 0px 0px 10px' }}>
			<Row style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
				<Col>
					<Typography.Text style={{ fontSize: 25 }}> Onur OZKAN </Typography.Text>
				</Col>
				<Popconfirm
					placement="bottomLeft"
					style={{ fontSize: 15 }}
					icon={<WarningOutlined style={{ color: 'red' }} />}
					title="Are you sure to delete this conversation?"
					onConfirm={params.deleteConversationFromState}
					okText="Yes"
					cancelText="No"
				>
				<Button
					type="link"
					danger
					icon={<DeleteFilled />}
				/>
				</Popconfirm>
			</Row>
			<Divider style={{ margin: 0, padding: 0 }} />
			<List
				style={{ marginTop: 10 }}
				itemLayout="horizontal"
				dataSource={messageList}
				renderItem={(item, index) => (
					<List.Item style={{ borderBottom: 0 }}>{renderMessages(item, index)}</List.Item>
				)}
			/>
			<Divider style={{ backgroundColor: 'transparent' }}/>
			<Form form={form} onFinish={handleMessageSend}>
				<Form.Item
					name="messageText"
					rules={[
						{ required: true, message: 'Write a message to send it' },
						() => ({
							validator(rule, value) {
								if (value && value.trim().length === 0) {
									return Promise.reject('Blank messages can not send')
								}
								return Promise.resolve()
							},
						})
					]}
					style={{ margin: 0 }}
				>
					<Input.TextArea rows={4} />
				</Form.Item>
				<Form.Item style={{ float: 'right' }}>
					<Button htmlType="submit"> Send </Button>
				</Form.Item>
			</Form>
		</div>
	)
}

export default ChatScreen