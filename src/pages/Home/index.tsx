import { Button, Col, Form, Input, Row, Select, Space, Steps } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

const Home: React.FC = () => {
  const [step, setStep] = useState<number>(0)
  const [form] = useForm()
  const history = useHistory()

  useEffect(() => {
    if (localStorage.getItem('gender')) {
      return history.push('/start')
    }
    form.setFieldsValue({ gender: 'other' })
  }, [])

  const finish = (values: any) => {
    if (values.name) {
      localStorage.setItem('name', values.name)
    }
    if (values.age) {
      localStorage.setItem('age', values.age)
    }
    if (values.gender) {
      localStorage.setItem('gender', values.gender)
    }
    if (step > 2) {
      return history.push('/start')
    }
  }

  return (
    <div className="container">
      <Row>
        <Col span={24} lg={{ span: 12, offset: 6 }}>
          <Steps current={step}>
            <Steps.Step title="Name" />
            <Steps.Step title="Age" />
            <Steps.Step title="Gender" />
          </Steps>
          <Form form={form} onFinish={finish} layout="vertical">
            <Form.Item name="name" help="Leave it blank to make it anonymously" style={{ marginTop: '30px', display: step !== 0 ? 'none' : 'block' }}>
              <Input size="large" />
            </Form.Item>
            <Form.Item name="age" help="Fill it with number" style={{ marginTop: '30px', display: step !== 1 ? 'none' : 'block' }}>
              <Input type="number" size="large" min={1} max={120} />
            </Form.Item>
            <Form.Item name="gender" help="Please select one in dropdown" style={{ marginTop: '30px', display: step !== 2 ? 'none' : 'block' }}>
              <Select size="large">
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ float: 'right' }}>
              <Space>
                { step > 0 ? <Button onClick={() => setStep(step - 1)}>Prev</Button> : '' }
                <Button htmlType="submit" type="primary" onClick={() => setStep(step + 1)}>Next</Button>
              </Space>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  )
}

export default Home