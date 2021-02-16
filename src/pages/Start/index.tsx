import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Form, Input, message, Popconfirm, Row, Space, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import Chart from 'chart.js'
import Recaptcha from 'react-google-invisible-recaptcha'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import './index.css'
import axios from 'axios'

const Start: React.FC = () => {
  const [form] = useForm()
  const history = useHistory()
  const [captcha, setCaptcha] = useState<any>()
  const [chart, setChart] = useState<any>()
  const [result, setResult] = useState<{ label: string, score: number }[]>()
  const [sentiment, setSentiment] = useState<string>()
  const [depression, setDepression] = useState<boolean>(false)

  useEffect(() => {
    if (!localStorage.getItem('gender')) {
      return history.push('/')
    }
  }, [])

  const finish = async (values: any) => {
    const tags = values.tags?.filter(Boolean)
    if (!tags?.length || tags.length < 2 || tags.length > 5) {
      return message.error('Please add options min 2 and max 5')
    }
    const payload = {
      token: await captcha?.execute(),
      user: {
        name: localStorage.getItem('name') || null,
        age: localStorage.getItem('age') || null,
        gender: localStorage.getItem('gender') || null
      },
      tags: tags
    }
    try {
      const { data } = await axios.post('/api/send', payload)
      setResult(data.result)
      setSentiment(data.sentiment.result[0].label && data.depression.result[0].score > 0.5)
      setDepression(data.depression.result[0].label === 'depresi' && data.depression.result[0].score > 0.5)
      const ctx = (document.querySelector('#chartResult') as any)?.getContext('2d')
      if (chart) {
        chart.destroy?.()
      }
      setChart(new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: data.result.map((res: any) => res.label),
          datasets: [{
            data: data.result.map((res: any) => res.score),
            backgroundColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ]
          }]
        },
        options: {
          legend: { display: false },
          scales: {
            yAxes: [
              {
                ticks: {
                  callback: (value: string) => `${value.substr(0, 10)}${value.length > 10 ? '...' : ''}`
                }
              }
            ],
            xAxes: [
              {
                ticks: { beginAtZero: true }
              }
            ]
          }
        }
      }))
    } catch (error) {
      return message.error(error?.response?.err || 'Something error, please wait a moment')
    }
  }

  const restart = () => {
    localStorage.clear()
    return history.push('/')
  }

  const reset = () => {
    if (result?.length) {
      setResult([])
    } else {
      form.setFieldsValue({ tags: [] })
    }
  }

  return (
    <div className="container">
      <Row>
        <Col span={24} lg={{ span: 10, offset: 7 }}>
          <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: '50px' }}>{result?.length ? 'AI: I think you should choose...' : 'Which one should I decide?'}</Typography.Title>
          <Form form={form} onFinish={finish} layout="vertical">
            { result?.length ? <>
              <canvas style={{ marginBottom: '50px' }} id="chartResult"></canvas>
              { sentiment === 'negatif' ? <Typography.Title level={4}>But, I don't think <em>"{result[0].label}"</em> is a good choice for you, do I? 🤔</Typography.Title> : '' }
              { depression ? <Typography.Title level={4}>Hmm, you look so desperate from the option <em>"{result[0].label}"</em>. But, why I make it in the first place?<br /><br /><br />I don't know.</Typography.Title> : '' }
            </> : <Form.List name="tags">
              {(fields, { add, remove }) =>
                <>
                  {fields.map(field =>
                    <Space className="space" key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...field}>
                        <Input placeholder="input your option..." />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  )}
                  <Form.Item style={{ textAlign: 'center' }}>
                    <Button onClick={() => add()} icon={<PlusOutlined />}>
                      Add Option
                    </Button>
                  </Form.Item>
                </>
              }
            </Form.List> }
            <Recaptcha
              ref={(ref: any) => setCaptcha(ref)}
              sitekey={process.env.REACT_APP_SITE_KEY_RECAPTCHA}
              badge="bottomleft" />
            <Divider />
            <Form.Item style={{ float: 'left' }}>
              <Popconfirm title="Are you sure to restart this from beginning?" onConfirm={restart}>
                <Button danger type="primary">Restart</Button>
              </Popconfirm>
            </Form.Item>
            <Form.Item style={{ float: 'right' }}>
              <Space>
                <Button onClick={reset}>{result?.length ? 'Back' : 'Reset'}</Button>
                <Button disabled={!!result?.length} htmlType="submit" type="primary">Send</Button>
              </Space>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  )
}

export default Start