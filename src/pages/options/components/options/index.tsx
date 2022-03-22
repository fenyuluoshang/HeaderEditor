import { Card, Checkbox, Form, Grid } from '@alifd/next';
import * as React from 'react';
import { prefs } from '@/share/core/storage';
import { t } from '@/share/core/utils';
import { defaultPrefValue, PrefValue } from '@/share/core/var';
import './index.less';
import Api from '@/share/core/api';
import emitter from '@/share/core/emitter';

const { Row, Col } = Grid;

interface OptionsProps {
  visible: boolean;
}

interface OptionsState {
  prefs: PrefValue;
}

const mapPrefToProps: { [key: string]: string } = {
  'manage-collapse-group': t('manage_collapse_group'),
  'exclude-he': t('rules_no_effect_for_he'),
  'add-hot-link': t('add_anti_hot_link_to_menu'),
  'show-common-header': t('display_common_header'),
  'include-headers': t('include_header_in_custom_function'),
  'modify-body': t('modify_body'),
  'is-debug': 'Enable debug',
};

export default class Options extends React.Component<OptionsProps, OptionsState> {
  constructor(props: any) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);

    this.state = {
      prefs: { ...defaultPrefValue },
    };
  }

  componentDidMount() {
    prefs.ready(() => {
      const newPrefs = { ...this.state.prefs };
      Object.keys(newPrefs).forEach(it => {
        newPrefs[it] = prefs.get(it);
      });
      this.setState({
        prefs: newPrefs,
      });
    });
    emitter.on(emitter.EVENT_PREFS_UPDATE, this.handleUpdate);
  }

  componentWillUnmount() {
    emitter.off(emitter.EVENT_PREFS_UPDATE, this.handleUpdate);
  }

  handleUpdate(key: string, val: any) {
    const newPrefs = { ...this.state.prefs };
    newPrefs[key] = val;
    this.setState({
      prefs: newPrefs,
    });
  }

  handleChange(name: string, checked: boolean) {
    const newPrefs = { ...this.state.prefs, [name]: checked };
    Api.setPrefs(name, checked);
    prefs.set(name, checked);
    this.setState({
      prefs: newPrefs,
    });
  }

  render() {
    return (
      <section className={`section-options ${this.props.visible ? 'visible' : 'in-visible'}`}>
        <Card showTitleBullet={false} contentHeight="auto" title={t('options')}>
          <Form>
            <Row wrap>
              {Object.entries(mapPrefToProps).map(it => (
                <Col span={24} m={12} key={it[0]}>
                  <Checkbox
                    onChange={this.handleChange.bind(this, it[0])}
                    checked={this.state.prefs[it[0]]}
                    label={it[1]}
                  />
                </Col>
              ))}
            </Row>
          </Form>
        </Card>
      </section>
    );
  }
}
