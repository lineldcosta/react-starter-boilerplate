import React from 'react';
import Container from 'reactstrap/lib/Container';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import HR from './HR';
import Ul from './Ul';

const links = [
  {
    id: 1,
    name: 'twitter',
    url: 'http://twitter.com',
  },
  {
    id: 2,
    name: 'google-plus',
    url: 'http://plus.google.com.com',
  },
  {
    id: 3,
    name: 'github',
    url: 'http://github.com/',
  },
  {
    id: 4,
    name: 'facebook',
    url: 'http://facebook.com',
  },
];

export default function Footer() {
  return (
    <footer>
      <HR />
      <Container>
        <Row>
          <Col lg={{ size: 8, offset: 2 }} md={{ size: 10, offset: 1 }}>
            <Ul>
              {links.map(x => (
                <li key={`footer-link-${x.id}`}>
                  <a href={x.url}>
                    <span className="fa-stack fa-lg">
                      <i className="fa fa-circle fa-stack-2x" />
                      <i className={`fa fa-${x.name} fa-stack-1x fa-inverse`} />
                    </span>
                  </a>
                </li>
              ))}
            </Ul>
            <p className="copyright text-muted text-center">
              Copyright © Your Website
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}