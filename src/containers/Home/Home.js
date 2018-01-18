import React from 'react';
import Container from 'reactstrap/lib/Container';
import Hero from './Hero';
import PageTitle from './PageTitle';
import SubTitle from './SubTitle';
import GithubButton from './GithubButton';
import PackageList from './PackageList';
import FeatureCards from './FeatureCards';
import Line from './Line';

export default function Home() {
  return (
    <div>
      <Hero>
        <PageTitle>React starter boilerplate</PageTitle>
        <SubTitle>
          Aaaa starter kit for universal React app, Your website is ready.
        </SubTitle>
        <GithubButton />
      </Hero>
      <Container>
        <PackageList />
        <Line title="Features" />
        <FeatureCards />
      </Container>
    </div>
  );
}
