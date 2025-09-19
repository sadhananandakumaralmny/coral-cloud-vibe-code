import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFoodPreferences from '@salesforce/apex/FoodPreferenceController.getFoodPreferences';
import saveFoodPreference from '@salesforce/apex/FoodPreferenceController.saveFoodPreference';

export default class FoodPreference extends LightningElement {
    @track selectedGuest;
    @track selectedSession;
    @track foodPreference;
    @track notes;
    @track foodPreferences = [];

    @wire(getFoodPreferences)
    wiredFoodPreferences({ error, data }) {
        if (data) {
            this.foodPreferences = data;
        } else if (error) {
            console.error(error);
        }
    }

    handleGuestChange(event) {
        this.selectedGuest = event.detail.recordId;
    }

    handleSessionChange(event) {
        this.selectedSession = event.detail.recordId;
    }

    handleFoodPreferenceChange(event) {
        this.foodPreference = event.detail.value;
    }

    handleNotesChange(event) {
        this.notes = event.detail.value;
    }

    handleSubmit() {
        saveFoodPreference({
            guestId: this.selectedGuest,
            sessionId: this.selectedSession,
            foodPreference: this.foodPreference,
            notes: this.notes
        })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Food preference saved',
                        variant: 'success'
                    })
                );
                this.clearForm();
                return getFoodPreferences();
            })
            .then(data => {
                this.foodPreferences = data;
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error saving record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    clearForm() {
        this.selectedGuest = '';
        this.selectedSession = '';
        this.foodPreference = '';
        this.notes = '';
        this.template.querySelectorAll('lightning-record-picker').forEach(picker => {
            picker.value = null;
        });
    }
}
