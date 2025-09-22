@IsTest
private class FoodPreferenceControllerTest {

    // Create a Session__c without setting Name (works for AutoNumber Name fields)
    private static Id createSession() {
        Schema.SObjectType st = Schema.getGlobalDescribe().get('Session__c');
        System.assertNotEquals(null, st,
            'Session__c object not found. Update test to target the correct object referenced by Food_Preference__c.Session__c.');
        SObject sess = st.newSObject();
        // Do NOT set Name; many orgs use AutoNumber or make it non-editable.
        // If your Session__c has other required fields, set them here.
        insert sess;
        return (Id)sess.get('Id');
    }

    @IsTest
    static void testSaveFoodPreference_andGetFoodPreferences() {
        // Arrange
        Contact guest = new Contact(LastName = 'Test Guest');
        insert guest;

        Id sessionId = createSession();

        String pref = 'Vegetarian';
        String notes = 'No dairy';

        // Act
        Test.startTest();
        FoodPreferenceController.saveFoodPreference(guest.Id, sessionId, pref, notes);
        List<Food_Preference__c> queried = FoodPreferenceController.getFoodPreferences();
        Test.stopTest();

        // Assert
        Food_Preference__c created = [
            SELECT Id, Guest__c, Session__c, Food_Preference__c, Notes__c
            FROM Food_Preference__c
            WHERE Guest__c = :guest.Id
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        System.assertEquals(sessionId, created.Session__c, 'Session__c should match the Session we created.');
        System.assertEquals(pref, created.Food_Preference__c);
        System.assertEquals(notes, created.Notes__c);

        System.assertNotEquals(null, queried);
        System.assert(queried.size() > 0, 'Expected at least one Food_Preference__c.');
        Boolean found = false;
        for (Food_Preference__c fp : queried) {
            if (fp.Id == created.Id) { found = true; break; }
        }
        System.assert(found, 'getFoodPreferences() should include the inserted record.');
    }

    @IsTest
    static void testSaveFoodPreference_AllowsNullNotes() {
        // Arrange
        Contact guest = new Contact(LastName = 'Another Guest');
        insert guest;

        Id sessionId = createSession();

        // Act
        Test.startTest();
        FoodPreferenceController.saveFoodPreference(guest.Id, sessionId, 'Vegan', null);
        Test.stopTest();

        // Assert
        Food_Preference__c fp = [
            SELECT Id, Guest__c, Session__c, Food_Preference__c, Notes__c
            FROM Food_Preference__c
            WHERE Guest__c = :guest.Id
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        System.assertEquals('Vegan', fp.Food_Preference__c);
        System.assertEquals(sessionId, fp.Session__c);
        System.assertEquals(null, fp.Notes__c);
    }
}
