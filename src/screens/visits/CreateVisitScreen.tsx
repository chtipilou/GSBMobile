// filepath: /GSBVTTMobile/GSBVTTMobile/src/screens/visits/CreateVisitScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { createVisit } from '../../api';

const CreateVisitScreen = () => {
  const [visitDetails, setVisitDetails] = useState({
    title: '',
    description: '',
    date: '',
  });

  const handleChange = (name: string, value: string) => {
    setVisitDetails({ ...visitDetails, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await createVisit(visitDetails);
      // Handle successful visit creation (e.g., navigate to VisitListScreen)
    } catch (error) {
      // Handle error (e.g., show error message)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Visit</Text>
      <Input
        placeholder="Title"
        value={visitDetails.title}
        onChangeText={(value) => handleChange('title', value)}
      />
      <Input
        placeholder="Description"
        value={visitDetails.description}
        onChangeText={(value) => handleChange('description', value)}
      />
      <Input
        placeholder="Date"
        value={visitDetails.date}
        onChangeText={(value) => handleChange('date', value)}
      />
      <Button title="Create Visit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default CreateVisitScreen;